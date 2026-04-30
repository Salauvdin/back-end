const model = require("./teamModel");
const { ForbiddenTenantError, ensureTenantId } = require("../../utils/tenantScope");

const normalizeJsonArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value;
};

const normalizeAssignedUsers = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((user) => {
      if (typeof user === "string") {
        return user.trim();
      }

      return (
        user?.name ||
        user?.registerName ||
        user?.userName ||
        ""
      ).trim();
    })
    .filter(Boolean);
};

const assertTeamTenantAccess = async (id, tenantId) => {
  const team = await model.getTeamById(id, tenantId);

  if (team) {
    return team;
  }

  if (await model.teamExists(id)) {
    throw new ForbiddenTenantError();
  }

  throw new Error("TEAM_NOT_FOUND");
};

const createTeam = async (payload, tenantId) => {
  ensureTenantId(tenantId);
  const name = payload?.name?.trim();

  if (!name) {
    throw new Error("Team name is required");
  }

  const result = await model.createTeam(name, tenantId);
  const assignedUsers = normalizeAssignedUsers(payload?.assignedUsers);
  const taskNames = normalizeJsonArray(payload?.taskNames);
  const comments = normalizeJsonArray(payload?.comments);

  if (assignedUsers.length || taskNames.length || comments.length) {
    await model.updateTeam(result.insertId, {
      name,
      taskNames: JSON.stringify(taskNames),
      assignedUsers: JSON.stringify(assignedUsers),
      comments: JSON.stringify(comments)
    }, tenantId);
  }

  return model.getTeamById(result.insertId, tenantId);
};

const getTeams = async (tenantId) => {
  return model.getTeams(tenantId);
};

const getTeamById = async (id, tenantId) => {
  return assertTeamTenantAccess(id, tenantId);
};

const getTeamTasks = async (id, tenantId) => {
  await getTeamById(id, tenantId);
  return model.getTeamTasks(id, tenantId);
};

const getTeamUsers = async (id, tenantId) => {
  await getTeamById(id, tenantId);
  return model.getTeamUsers(id, tenantId);
};

const getTeamComments = async (id, tenantId) => {
  await getTeamById(id, tenantId);
  return model.getTeamComments(id, tenantId);
};

const updateTeam = async (id, payload, tenantId) => {
  const team = await assertTeamTenantAccess(id, tenantId);

  const name = payload?.name?.trim();

  if (!name) {
    throw new Error("Team name is required");
  }

  const taskNames = normalizeJsonArray(payload?.taskNames ?? team.taskNames);
  const assignedUsers = normalizeAssignedUsers(payload?.assignedUsers ?? team.assignedUsers);
  const comments = normalizeJsonArray(payload?.comments ?? team.comments);

  await model.updateTeam(id, {
    name,
    taskNames: JSON.stringify(taskNames),
    assignedUsers: JSON.stringify(assignedUsers),
    comments: JSON.stringify(comments)
  }, tenantId);
  return model.getTeamById(id, tenantId);
};

const deleteTeam = async (id, tenantId) => {
  await assertTeamTenantAccess(id, tenantId);
  await model.deleteTeam(id, tenantId);
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  getTeamTasks,
  getTeamUsers,
  getTeamComments,
  updateTeam,
  deleteTeam
};
