const connection = require("../../../Connection")
const { ensureTenantId, isSuperAdminTenant, pickTenantColumn, requireTenantColumn } = require("../../../utils/tenantScope")
const USER_TABLE = "userTaskDetails"

let userSchemaCache = null

const pickColumn = (columns, candidates) => {
  for (const candidate of candidates) {
    if (columns.includes(candidate)) return candidate
  }
  return null
}

const hasTenantWideAccess = (role, tenantId) => {
  const normalizedRole = String(role || "").toLowerCase()
  return isSuperAdminTenant(tenantId) || normalizedRole.includes("admin")
}

const resolveUserSchema = async () => {
  if (userSchemaCache) return userSchemaCache

  const rows = await connection.dbconnection.query(`SHOW COLUMNS FROM ${USER_TABLE}`)
  const columns = rows.map((row) => row.Field)

  userSchemaCache = {
    tableName: USER_TABLE,
    registerId: pickColumn(columns, ["registerId"]),
    registerName: pickColumn(columns, ["registerName"]),
    registerEmail: pickColumn(columns, ["registerEmail"]),
    registerRole: pickColumn(columns, ["registerRole"]),
    registerPassword: pickColumn(columns, ["registerPassword"]),
    timezone: pickColumn(columns, ["timezone", "timeZone", "userTimezone"]),
    tenantId: pickTenantColumn(columns),
    createdBy: pickColumn(columns, ["createdBy", "created_by", "userId"]),
    createdAt: pickColumn(columns, ["createdAt", "created_at"]),
    deleteData: pickColumn(columns, ["deleteData", "isDeleted", "deleted"])
  }

  requireTenantColumn(userSchemaCache)

  return userSchemaCache
}

// Add user with password and createdBy
const Addmodel = async (registerName, registerEmail, registerRole, registerPassword, createdBy, timezone = "IST", tenantId) => {
  const schema = await resolveUserSchema()

  return new Promise((resolve, reject) => {
    // If no password provided, use a default temporary password
    if (!registerPassword) {
      registerPassword = 'Temp123456' // Will be hashed before reaching database
      console.log("No password provided, using temporary default")
    }
    const fields = [
      schema.registerName,
      schema.registerEmail,
      schema.registerRole,
      schema.registerPassword,
      schema.createdBy,
      schema.tenantId
    ]
    const params = [registerName, registerEmail, registerRole, registerPassword, createdBy, ensureTenantId(tenantId)]

    if (schema.timezone) {
      fields.push(schema.timezone)
      params.push(timezone || "IST")
    }

    let query = `INSERT INTO ${schema.tableName} (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`
    console.log(registerName, registerEmail, registerRole, "model adding user with password")
    connection.dbconnection.query(query, params, (err, res) => {
      if (err) {
        console.log(err, "model error")
        return reject(err)
      }
      return resolve(res)
    })
  })
}

// Each user can see only users created by them
const Getmodel = async (currentUserId, currentUserRole, tenantId) => {
  const schema = await resolveUserSchema()
  const selectFields = [
    `${schema.registerId} AS registerId`,
    `${schema.registerName} AS registerName`,
    `${schema.registerEmail} AS registerEmail`,
    `${schema.registerRole} AS registerRole`,
    `${schema.registerPassword} AS registerPassword`,
    schema.timezone ? `${schema.timezone} AS timezone` : `'IST' AS timezone`,
    `${schema.createdBy} AS createdBy`,
    schema.createdAt ? `${schema.createdAt} AS createdAt` : `NULL AS createdAt`
  ]

  let query = `SELECT ${selectFields.join(", ")} FROM ${schema.tableName}`
  const conditions = []
  const params = []

  if (!isSuperAdminTenant(tenantId)) {
    conditions.push(`${schema.tenantId} = ?`)
    params.push(ensureTenantId(tenantId))
  }

  if (schema.deleteData) {
    conditions.push(`${schema.deleteData} = 1`)
  }

  if (schema.createdBy && !hasTenantWideAccess(currentUserRole, tenantId)) {
    conditions.push(`${schema.createdBy} = ?`)
    params.push(currentUserId)
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`
  }

  return connection.dbconnection.query(query, params)
}

// Update user with optional password
const Updatemodel = async (registerName, registerEmail, registerRole, registerId, registerPassword = null, timezone = null, tenantId) => {
  const schema = await resolveUserSchema()

  return new Promise((resolve, reject) => {
    const updates = [
      `${schema.registerName} = ?`,
      `${schema.registerEmail} = ?`,
      `${schema.registerRole} = ?`
    ]
    const params = [registerName, registerEmail, registerRole]

    if (registerPassword) {
      updates.push(`${schema.registerPassword} = ?`)
      params.push(registerPassword)
    }

    if (schema.timezone && timezone) {
      updates.push(`${schema.timezone} = ?`)
      params.push(timezone)
    }

    params.push(registerId)
    let query = `UPDATE ${schema.tableName} SET ${updates.join(", ")} WHERE ${schema.registerId} = ?`

    if (!isSuperAdminTenant(tenantId)) {
      query += ` AND ${schema.tenantId} = ?`
      params.push(ensureTenantId(tenantId))
    }

    connection.dbconnection.query(query, params, (err, res) => {
      if (err) {
        console.log(err, "update model error")
        return reject(err)
      }
      return resolve(res)
    })
  })
}

// Soft delete user
const Deletemodel = async (registerId, tenantId) => {
  const schema = await resolveUserSchema()
  return new Promise((resolve, reject) => {
    let query = `UPDATE ${schema.tableName} SET ${schema.deleteData} = 0 WHERE ${schema.registerId} = ?${isSuperAdminTenant(tenantId) ? "" : ` AND ${schema.tenantId} = ?`}`
    connection.dbconnection.query(query, isSuperAdminTenant(tenantId) ? [registerId] : [registerId, ensureTenantId(tenantId)], (err, res) => {
      if (err) {
        console.log(err, "delete model error")
        return reject(err)
      }
      return resolve(res)
    })
  })
}

// Get single user by id with ownership check
const GetUserById = async (userId, currentUserId, currentUserRole, tenantId) => {
  const schema = await resolveUserSchema()

  return new Promise((resolve, reject) => {
    let query = `
      SELECT ${schema.registerId} AS registerId,
             ${schema.registerName} AS registerName,
             ${schema.registerEmail} AS registerEmail,
             ${schema.registerRole} AS registerRole,
             ${schema.timezone ? `${schema.timezone} AS timezone,` : `'IST' AS timezone,`}
             ${schema.createdBy} AS createdBy
      FROM ${schema.tableName}
      WHERE ${schema.registerId} = ?
      ${isSuperAdminTenant(tenantId) ? "" : `AND ${schema.tenantId} = ?`}
    `;
    const params = isSuperAdminTenant(tenantId) ? [userId] : [userId, ensureTenantId(tenantId)];

    if (schema.deleteData) {
      query += ` AND ${schema.deleteData} = 1`;
    }

    // Allow admins to access any active user, allow self access, and keep creator ownership checks.
    if (String(currentUserRole).toLowerCase() !== "admin") {
      query += ` AND (${schema.createdBy} = ? OR ${schema.registerId} = ?)`;
      params.push(currentUserId, currentUserId);
    }

    connection.dbconnection.query(query, params, (err, res) => {
      if (err) {
        console.log(err, "get user by id model error");
        return reject(err);
      }
      return resolve(res?.[0] || null);
    });
  });
}

const UserExists = async (userId) => {
  const schema = await resolveUserSchema()
  const rows = await connection.dbconnection.query(
    `SELECT ${schema.registerId} FROM ${schema.tableName} WHERE ${schema.registerId} = ? LIMIT 1`,
    [userId]
  )

  return Boolean(rows?.[0])
}

module.exports = { Addmodel, Getmodel, Updatemodel, Deletemodel, GetUserById, UserExists }
