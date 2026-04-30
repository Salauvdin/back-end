const service = require("./teamService");

const getTenantId = (req) => req.user?.tenantId;

const handleTenantError = (res, err) => {
  if (err.code === "TENANT_MISMATCH") {
    return res.status(403).json({ message: "Tenant mismatch" });
  }

  if (err.code === "TENANT_REQUIRED") {
    return res.status(401).json({ message: "Tenant missing from token" });
  }

  return null;
};

const createTeam = async (req, res) => {
  try {
    const team = await service.createTeam(req.body, getTenantId(req));
    return res.status(201).json({
      message: "Team created successfully",
      value: team
    });
  } catch (err) {
    const tenantResponse = handleTenantError(res, err);
    if (tenantResponse) return tenantResponse;

    if (err.message === "Team name is required") {
      return res.status(400).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await service.getTeams(getTenantId(req));
    return res.status(200).json({
      message: "Teams retrieved successfully",
      value: teams
    });
  } catch (err) {
    const tenantResponse = handleTenantError(res, err);
    if (tenantResponse) return tenantResponse;

    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTeamById = async (req, res) => {
  try {
    const team = await service.getTeamById(req.params.id, getTenantId(req));
    return res.status(200).json({
      message: "Team retrieved successfully",
      value: team
    });
  } catch (err) {
    const tenantResponse = handleTenantError(res, err);
    if (tenantResponse) return tenantResponse;

    if (err.message === "TEAM_NOT_FOUND") {
      return res.status(404).json({ message: "Team not found" });
    }

    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTeamTasks = async (req, res) => {
  try {
    const tasks = await service.getTeamTasks(req.params.id, getTenantId(req));
    return res.status(200).json({
      message: "Team tasks retrieved successfully",
      value: tasks
    });
  } catch (err) {
    const tenantResponse = handleTenantError(res, err);
    if (tenantResponse) return tenantResponse;

    if (err.message === "TEAM_NOT_FOUND") {
      return res.status(404).json({ message: "Team not found" });
    }

    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTeamUsers = async (req, res) => {
  try {
    const users = await service.getTeamUsers(req.params.id, getTenantId(req));
    return res.status(200).json({
      message: "Team users retrieved successfully",
      value: users
    });
  } catch (err) {
    const tenantResponse = handleTenantError(res, err);
    if (tenantResponse) return tenantResponse;

    if (err.message === "TEAM_NOT_FOUND") {
      return res.status(404).json({ message: "Team not found" });
    }

    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTeamComments = async (req, res) => {
  try {
    const comments = await service.getTeamComments(req.params.id, getTenantId(req));
    return res.status(200).json({
      message: "Team comments retrieved successfully",
      value: comments
    });
  } catch (err) {
    const tenantResponse = handleTenantError(res, err);
    if (tenantResponse) return tenantResponse;

    if (err.message === "TEAM_NOT_FOUND") {
      return res.status(404).json({ message: "Team not found" });
    }

    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const team = await service.updateTeam(req.params.id, req.body, getTenantId(req));
    return res.status(200).json({
      message: "Team updated successfully",
      value: team
    });
  } catch (err) {
    const tenantResponse = handleTenantError(res, err);
    if (tenantResponse) return tenantResponse;

    if (err.message === "TEAM_NOT_FOUND") {
      return res.status(404).json({ message: "Team not found" });
    }

    if (err.message === "Team name is required") {
      return res.status(400).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    await service.deleteTeam(req.params.id, getTenantId(req));
    return res.status(200).json({
      message: "Team deleted successfully"
    });
  } catch (err) {
    const tenantResponse = handleTenantError(res, err);
    if (tenantResponse) return tenantResponse;

    if (err.message === "TEAM_NOT_FOUND") {
      return res.status(404).json({ message: "Team not found" });
    }

    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
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
