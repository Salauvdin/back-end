const service = require("./Taskservice")

const getTenantId = (req) => req.user?.tenantId;

const handleAccessError = (res, err) => {
  if (err.code === "TENANT_MISMATCH") {
    return res.status(403).json({ message: "Tenant mismatch" });
  }

  if (err.code === "TENANT_REQUIRED") {
    return res.status(401).json({ message: "Tenant missing from token" });
  }

  if (err.message === "TASK_NOT_FOUND") {
    return res.status(404).json({ message: "Task not found" });
  }

  return null;
};

const normalizeTaskPayload = (rawBody = {}) => {
  const body = rawBody?.data && typeof rawBody.data === "object" ? rawBody.data : rawBody;

  return {
    ...body,
    taskId: body.taskId ?? body.id ?? null,
    taskName: body.taskName ?? body.name ?? null,
    status: body.status ?? body.Statues ?? "Pending",
    priority: body.priority ?? body.Priorty ?? "Medium",
    startDate: body.startDate ?? body.dueDate ?? null,
    assignedTo: body.assignedTo ?? null
  };
};

// Add task
const Addcontroller = async (req, res) => {
  try {
    const addData = normalizeTaskPayload(req.body);
    const createdBy = req.user?.id || req.user?.registerId || req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const missingFields = [];
    if (!addData.taskName) missingFields.push("taskName");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    addData.createdBy = createdBy;
    addData.tenantId = getTenantId(req);

    const servicedata = await service.Addservice(addData);
    return res.status(200).json({ message: "Task added successfully", data: servicedata });
  } catch (err) {
    const accessResponse = handleAccessError(res, err);
    if (accessResponse) return accessResponse;

    console.error(err)
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const Getcontroller = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.user?.registerId || req.user?.userId;
    const currentUserRole = req.user?.role || req.user?.registerRole;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const serviceGetdata = await service.Getservice(currentUserId, currentUserRole, getTenantId(req));
    return res.status(200).json({ message: "Tasks retrieved successfully", value: serviceGetdata });
  } catch (err) {
    const accessResponse = handleAccessError(res, err);
    if (accessResponse) return accessResponse;

    console.error(err)
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update task
const Updatecontroller = async (req, res) => {
  try {
    const updateData = normalizeTaskPayload(req.body);
    updateData.taskId = req.params.id || updateData.taskId;
    updateData.createdBy = req.user?.id || req.user?.registerId || req.user?.userId || null;
    updateData.tenantId = getTenantId(req);
    console.log(updateData, "update task data")

    if (!updateData.taskId) {
      return res.status(400).json({ message: "Missing required field: taskId" });
    }

    if (!updateData.taskName) {
      return res.status(400).json({ message: "Missing required field: taskName" });
    }

    const updateResult = await service.Updateservice(updateData)
    return res.status(200).json({
      message: "Task updated successfully",
      value: updateResult
    })
  } catch (err) {
    const accessResponse = handleAccessError(res, err);
    if (accessResponse) return accessResponse;

    console.error(err)
    return res.status(500).json({
      message: "Server error",
      error: err.message
    })
  }
}

// Delete task
const Deletecontroller = async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log("Task ID:", taskId)

    if (!taskId) {
      return res.status(400).json({ message: "Missing required field: taskId" });
    }

    const deleteResult = await service.Deleteservice(taskId, getTenantId(req))
    return res.status(200).json({
      message: "Task deleted successfully",
      value: deleteResult
    })
  } catch (err) {
    const accessResponse = handleAccessError(res, err);
    if (accessResponse) return accessResponse;

    console.error(err)
    return res.status(500).json({
      message: "Server error",
      error: err.message
    })
  }
}

module.exports = { Addcontroller, Getcontroller, Updatecontroller, Deletecontroller }
