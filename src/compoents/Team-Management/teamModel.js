const connection = require("../../Connection");
const { ensureTenantId, isSuperAdminTenant } = require("../../utils/tenantScope");

const parseJsonArray = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const mapTeamRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    taskNames: parseJsonArray(row.taskNames),
    assignedUsers: parseJsonArray(row.assignedUsers),
    comments: parseJsonArray(row.comments)
  };
};

const createTeam = async (name, tenantId) => {
  const query = `
    INSERT INTO teams (teamName, taskName, assignedUser, comments, tenantid)
    VALUES (?, '[]', '[]', '[]', ?)
  `;
  return connection.dbconnection.query(query, [name, ensureTenantId(tenantId)]);
};

const getTeams = async (tenantId) => {
  const query = `
    SELECT
      t.id,
      t.teamName AS name,
      t.createdAt,
      COALESCE(t.taskName, '[]') AS taskNames,
      COALESCE(t.assignedUser, '[]') AS assignedUsers,
      COALESCE(t.comments, '[]') AS comments
    FROM teams t
    ORDER BY t.createdAt DESC, t.id DESC
  `;

  const rows = await connection.dbconnection.query(
    isSuperAdminTenant(tenantId) ? query : query.replace("ORDER BY", "WHERE t.tenantid = ? ORDER BY"),
    isSuperAdminTenant(tenantId) ? [] : [ensureTenantId(tenantId)]
  );
  return rows.map(mapTeamRow);
};

const getTeamById = async (id, tenantId) => {
  const query = `
    SELECT
      t.id,
      t.teamName AS name,
      t.createdAt,
      COALESCE(t.taskName, '[]') AS taskNames,
      COALESCE(t.assignedUser, '[]') AS assignedUsers,
      COALESCE(t.comments, '[]') AS comments
    FROM teams t
    WHERE t.id = ?${isSuperAdminTenant(tenantId) ? "" : " AND t.tenantid = ?"}
    LIMIT 1
  `;

  const rows = await connection.dbconnection.query(
    query,
    isSuperAdminTenant(tenantId) ? [id] : [id, ensureTenantId(tenantId)]
  );
  return mapTeamRow(rows?.[0] || null);
};

const getTeamTasks = async (teamId, tenantId) => {
  const team = await getTeamById(teamId, tenantId);
  return team?.taskNames || [];
};

const getTeamUsers = async (teamId, tenantId) => {
  const team = await getTeamById(teamId, tenantId);
  return team?.assignedUsers || [];
};

const getTeamComments = async (teamId, tenantId) => {
  const team = await getTeamById(teamId, tenantId);
  return team?.comments || [];
};

const updateTeam = async (id, payload, tenantId) => {
  const query = `
    UPDATE teams
    SET teamName = ?, taskName = ?, assignedUser = ?, comments = ?
    WHERE id = ?${isSuperAdminTenant(tenantId) ? "" : " AND tenantid = ?"}
  `;

  const params = [
    payload.name,
    payload.taskNames,
    payload.assignedUsers,
    payload.comments,
    id
  ];

  if (!isSuperAdminTenant(tenantId)) {
    params.push(ensureTenantId(tenantId));
  }

  return connection.dbconnection.query(query, params);
};

const deleteTeam = async (id, tenantId) => {
  const query = `DELETE FROM teams WHERE id = ?${isSuperAdminTenant(tenantId) ? "" : " AND tenantid = ?"}`;
  return connection.dbconnection.query(
    query,
    isSuperAdminTenant(tenantId) ? [id] : [id, ensureTenantId(tenantId)]
  );
};

const teamExists = async (id) => {
  const rows = await connection.dbconnection.query("SELECT id FROM teams WHERE id = ? LIMIT 1", [id]);
  return Boolean(rows?.[0]);
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  getTeamTasks,
  getTeamUsers,
  getTeamComments,
  updateTeam,
  deleteTeam,
  teamExists
};
