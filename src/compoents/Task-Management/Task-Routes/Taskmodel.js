const connection = require("../../../Connection")
const { ensureTenantId, isSuperAdminTenant, pickTenantColumn, requireTenantColumn } = require("../../../utils/tenantScope")
const TASK_TABLE_CANDIDATES = ["taskDetails", "TaskDetails", "taskdetails"];

let schemaCache = null;

const pickColumn = (columns, candidates) => {
  for (const candidate of candidates) {
    if (columns.includes(candidate)) return candidate;
  }
  return null;
};

const hasTenantWideAccess = (role, tenantId) => {
  const normalizedRole = String(role || "").toLowerCase();
  return isSuperAdminTenant(tenantId) || normalizedRole.includes("admin");
};

const resolveTaskSchema = async () => {
  if (schemaCache) return schemaCache;

  for (const tableName of TASK_TABLE_CANDIDATES) {
    try {
      const rows = await connection.dbconnection.query(`SHOW COLUMNS FROM ${tableName}`);
      const columns = rows.map((row) => row.Field);

      const schema = {
        tableName,
        columns,
        taskId: pickColumn(columns, ["taskId", "id", "TaskId"]),
        taskName: pickColumn(columns, ["taskName", "name", "TaskName"]),
        status: pickColumn(columns, ["Statues", "status", "Status"]),
        priority: pickColumn(columns, ["Priorty", "priority", "Priority"]),
        startDate: pickColumn(columns, ["startDate", "dueDate", "taskDate", "StartDate"]),
        createdBy: pickColumn(columns, ["createdBy", "created_by", "userId"]),
        assignedTo: pickColumn(columns, ["assignedTo", "assigned_to", "assigned_user_id", "assigneeId"]),
        tenantId: pickTenantColumn(columns),
        createdAt: pickColumn(columns, ["createdAt", "created_at"]),
        deleteData: pickColumn(columns, ["deleteData", "isDeleted", "deleted"])
      };

      if (!schema.taskId || !schema.taskName) {
        throw new Error(`Task table ${tableName} is missing required columns`);
      }
      requireTenantColumn(schema);

      schemaCache = schema;
      return schema;
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE") continue;
      throw err;
    }
  }

  throw new Error(`Task table not found. Tried: ${TASK_TABLE_CANDIDATES.join(", ")}`);
};

const buildTaskSelectFields = (schema) => {
  const selectFields = [
    `${schema.taskId} AS taskId`,
    `${schema.taskName} AS taskName`
  ];

  if (schema.status) {
    selectFields.push(`${schema.status} AS status`);
    selectFields.push(`${schema.status} AS Statues`);
  } else {
    selectFields.push(`'Pending' AS status`);
    selectFields.push(`'Pending' AS Statues`);
  }

  if (schema.priority) {
    selectFields.push(`${schema.priority} AS priority`);
    selectFields.push(`${schema.priority} AS Priorty`);
  } else {
    selectFields.push(`'Medium' AS priority`);
    selectFields.push(`'Medium' AS Priorty`);
  }

  if (schema.startDate) {
    selectFields.push(`${schema.startDate} AS startDate`);
    selectFields.push(`${schema.startDate} AS dueDate`);
  } else {
    selectFields.push(`NULL AS startDate`);
    selectFields.push(`NULL AS dueDate`);
  }

  if (schema.createdBy) {
    selectFields.push(`${schema.createdBy} AS createdBy`);
  } else {
    selectFields.push(`NULL AS createdBy`);
  }

  if (schema.assignedTo) {
    selectFields.push(`${schema.assignedTo} AS assignedTo`);
  } else {
    selectFields.push(`NULL AS assignedTo`);
  }

  if (schema.createdAt) {
    selectFields.push(`${schema.createdAt} AS createdAt`);
  } else {
    selectFields.push(`NULL AS createdAt`);
  }

  return selectFields;
};

// Add task
const Addmodel = async (taskName, status, priority, startDate, createdBy, assignedTo, tenantId) => {
  const schema = await resolveTaskSchema();
  const insertColumns = [schema.taskName];
  const values = [taskName];

  if (schema.status) {
    insertColumns.push(schema.status);
    values.push(status);
  }
  if (schema.priority) {
    insertColumns.push(schema.priority);
    values.push(priority);
  }
  if (schema.startDate) {
    insertColumns.push(schema.startDate);
    values.push(startDate && startDate.trim() !== '' ? startDate : null);
  }
  if (schema.createdBy) {
    insertColumns.push(schema.createdBy);
    values.push(createdBy);
  }
  if (schema.assignedTo && assignedTo) {
    insertColumns.push(schema.assignedTo);
    values.push(assignedTo);
  }
  insertColumns.push(schema.tenantId);
  values.push(ensureTenantId(tenantId));

  const placeholders = insertColumns.map(() => "?").join(", ");
  const query = `INSERT INTO ${schema.tableName} (${insertColumns.join(", ")}) VALUES (${placeholders})`;
  return connection.dbconnection.query(query, values);
}

// Each user can see only tasks created by them
const Getmodel = async (currentUserId, currentUserRole, tenantId) => {
  const schema = await resolveTaskSchema();
  const selectFields = buildTaskSelectFields(schema);

  let query = `SELECT ${selectFields.join(", ")} FROM ${schema.tableName}`;
  const conditions = [];
  const params = [];

  if (!isSuperAdminTenant(tenantId)) {
    conditions.push(`${schema.tenantId} = ?`);
    params.push(ensureTenantId(tenantId));
  }

  if (schema.deleteData) {
    conditions.push(`${schema.deleteData} = 1`);
  }

  if (schema.createdBy && !hasTenantWideAccess(currentUserRole, tenantId)) {
    conditions.push(`${schema.createdBy} = ?`);
    params.push(currentUserId);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  return connection.dbconnection.query(query, params);
}

const GetTaskByIdmodel = async (taskId, tenantId) => {
  const schema = await resolveTaskSchema();
  const selectFields = buildTaskSelectFields(schema);
  const conditions = [`${schema.taskId} = ?`];
  const params = [taskId];

  if (!isSuperAdminTenant(tenantId)) {
    conditions.push(`${schema.tenantId} = ?`);
    params.push(ensureTenantId(tenantId));
  }

  if (schema.deleteData) {
    conditions.push(`${schema.deleteData} = 1`);
  }

  const query = `
    SELECT ${selectFields.join(", ")}
    FROM ${schema.tableName}
    WHERE ${conditions.join(" AND ")}
    LIMIT 1
  `;

  const rows = await connection.dbconnection.query(query, params);
  return rows?.[0] || null;
}

// Update task
const Updatemodel = async (taskName, status, priority, startDate, taskId, assignedTo, tenantId) => {
  const schema = await resolveTaskSchema();
  const updates = [`${schema.taskName} = ?`];
  const params = [taskName];

  if (schema.status) {
    updates.push(`${schema.status} = ?`);
    params.push(status);
  }
  if (schema.priority) {
    updates.push(`${schema.priority} = ?`);
    params.push(priority);
  }
  if (schema.startDate) {
    updates.push(`${schema.startDate} = ?`);
    params.push(startDate && startDate.trim() !== '' ? startDate : null);
  }
  if (schema.assignedTo && assignedTo !== undefined) {
    updates.push(`${schema.assignedTo} = ?`);
    params.push(assignedTo);
  }

  params.push(taskId);
  let query = `UPDATE ${schema.tableName} SET ${updates.join(", ")} WHERE ${schema.taskId} = ?`;
  if (!isSuperAdminTenant(tenantId)) {
    query += ` AND ${schema.tenantId} = ?`;
    params.push(ensureTenantId(tenantId));
  }
  return connection.dbconnection.query(query, params);
}

// Soft delete task
const Deletemodel = async (taskId, tenantId) => {
  const schema = await resolveTaskSchema();
  if (schema.deleteData) {
    const query = `UPDATE ${schema.tableName} SET ${schema.deleteData} = 0 WHERE ${schema.taskId} = ?${isSuperAdminTenant(tenantId) ? "" : ` AND ${schema.tenantId} = ?`}`;
    return connection.dbconnection.query(query, isSuperAdminTenant(tenantId) ? [taskId] : [taskId, ensureTenantId(tenantId)]);
  }
  const query = `DELETE FROM ${schema.tableName} WHERE ${schema.taskId} = ?${isSuperAdminTenant(tenantId) ? "" : ` AND ${schema.tenantId} = ?`}`;
  return connection.dbconnection.query(query, isSuperAdminTenant(tenantId) ? [taskId] : [taskId, ensureTenantId(tenantId)]);
}

const TaskExists = async (taskId) => {
  const schema = await resolveTaskSchema();
  const rows = await connection.dbconnection.query(
    `SELECT ${schema.taskId} FROM ${schema.tableName} WHERE ${schema.taskId} = ? LIMIT 1`,
    [taskId]
  );
  return Boolean(rows?.[0]);
}

module.exports = { Addmodel, Getmodel, GetTaskByIdmodel, Updatemodel, Deletemodel, TaskExists }
