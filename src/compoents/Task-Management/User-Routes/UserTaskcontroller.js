const service = require("./UserTaskservice")
const model = require("./UserTaskmodel")
const permissionService = require("./UserPermissionservice")

const normalizeUserPayload = (body = {}) => ({
  ...body,
  registerName: body.registerName ?? body.userName ?? null,
  registerEmail: body.registerEmail ?? body.email ?? null,
  registerRole: body.registerRole ?? body.userRole ?? null,
  registerPassword: body.registerPassword ?? body.password ?? body.userPassword ?? null,
  timezone: body.timezone ?? body.userTimezone ?? null,
  userName: body.userName ?? body.registerName ?? null,
  email: body.email ?? body.registerEmail ?? null,
  userRole: body.userRole ?? body.registerRole ?? null,
  password: body.password ?? body.registerPassword ?? body.userPassword ?? null,
  userTimezone: body.userTimezone ?? body.timezone ?? null
});

const getTenantId = (req) => req.user?.tenantId;

const handleAccessError = (res, err) => {
  if (err.code === "TENANT_MISMATCH") {
    return res.status(403).json({ message: "Tenant mismatch" });
  }

  if (err.code === "TENANT_REQUIRED") {
    return res.status(401).json({ message: "Tenant missing from token" });
  }

  if (err.message === "USER_NOT_FOUND") {
    return res.status(404).json({ message: "User not found" });
  }

  return null;
};

// Add user with permissions
const Addcontroller = async (req, res) => {
  try {
    const addData = normalizeUserPayload(req.body);
    const createdBy = req.user?.id || req.user?.registerId || req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    if (!addData.registerName || !addData.registerEmail || !addData.registerRole) {
      return res.status(400).json({
        message: "Missing required fields: registerName, registerEmail, registerRole"
      });
    }

    addData.createdBy = createdBy;
    addData.tenantId = getTenantId(req);
    console.log("Controller - Adding user with createdBy:", createdBy)
    
    const servicedata = await service.Addservice(addData)
    
    return res.status(200).json({
      message: 'User added successfully',
      data: servicedata
    })
  } catch (err) {
    const accessResponse = handleAccessError(res, err);
    if (accessResponse) return accessResponse;

    console.error("Error in Addcontroller:", err)
    return res.status(500).json({
      message: "Server error",
      error: err.message
    })
  }
}

// Get all users with hierarchical access
const Getcontroller = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.user?.registerId || req.user?.userId;
    const currentUserRole = req.user?.role || req.user?.registerRole;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    console.log(`Controller - Getting users for user ${currentUserId} with role ${currentUserRole}`)

    const serviceGetdata = await service.Getservice(currentUserId, currentUserRole, getTenantId(req))
    
    return res.status(200).json({
      message: "Users retrieved successfully",
      value: serviceGetdata
    })
  } catch (err) {
    const accessResponse = handleAccessError(res, err);
    if (accessResponse) return accessResponse;

    console.error("Error in Getcontroller:", err)
    return res.status(500).json({
      message: "Server error",
      error: err.message
    })
  }
}

// Update user with permissions
const Updatecontroller = async (req, res) => {
  try {
    const updatedatas = normalizeUserPayload(req.body)
    const currentUserId = req.user?.id || req.user?.registerId || req.user?.userId;
    const currentUserRole = req.user?.role || req.user?.registerRole;
    
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userIdToUpdate = req.params.id || updatedatas.userId || updatedatas.registerId;
    if (!userIdToUpdate) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Keep route param as the source of truth for update target.
    updatedatas.userId = userIdToUpdate;
    updatedatas.registerId = userIdToUpdate;

    await service.assertUserTenantAccess(userIdToUpdate, currentUserId, currentUserRole, getTenantId(req));
    
    updatedatas.createdBy = currentUserId;
    updatedatas.tenantId = getTenantId(req);
    console.log("Controller - Updating user:", userIdToUpdate)

    const serviceData = await service.Updateservice(updatedatas)

    return res.status(200).json({
      message: "User updated successfully",
      value: serviceData
    })
  } catch (err) {
    const accessResponse = handleAccessError(res, err);
    if (accessResponse) return accessResponse;

    console.error("Error in Updatecontroller:", err)
    return res.status(500).json({
      message: "Server error",
      error: err.message
    })
  }
}

// Delete user and their permissions
const Deletecontroller = async (req, res) => {
  try {
    const userId = req.params.id
    const currentUserId = req.user?.id || req.user?.registerId || req.user?.userId;
    const currentUserRole = req.user?.role || req.user?.registerRole;
    
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check permission to delete
    await service.assertUserTenantAccess(userId, currentUserId, currentUserRole, getTenantId(req));
    
    console.log("Controller - Deleting user:", userId)
    const deleteResult = await service.Deleteservice(userId, getTenantId(req))
    
    return res.status(200).json({
      message: "User deleted successfully",
      value: deleteResult
    })
  } catch (err) {
    const accessResponse = handleAccessError(res, err);
    if (accessResponse) return accessResponse;

    console.error("Error in Deletecontroller:", err)
    return res.status(500).json({
      message: "Server error",
      error: err.message
    })
  }
}

module.exports = { Addcontroller, Getcontroller, Updatecontroller, Deletecontroller }
