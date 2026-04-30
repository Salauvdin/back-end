const model = require("./Taskmodel")
const notificationService = require("../../Notifications/Notificationservice");
const { ForbiddenTenantError, ensureTenantId } = require("../../../utils/tenantScope");

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

const Addservice = async (addData) => {
   console.log("=== ADD TASK SERVICE ===");
   console.log("Received data:", JSON.stringify(addData, null, 2));

   const normalizedData = normalizeTaskPayload(addData);
   const taskName = normalizedData.taskName;
   const status = normalizedData.status;
   const priority = normalizedData.priority;
   const startDate = normalizedData.startDate;
   const assignedTo = normalizedData.assignedTo;
   const tenantId = ensureTenantId(addData.tenantId);

   if (!taskName) {
      throw new Error("Missing required task field: taskName")
   }

   const taskResult = await model.Addmodel(
      taskName,
      status,
      priority,
      startDate,
      addData.createdBy,
      assignedTo,
      tenantId
   )

   if (assignedTo) {
      await notificationService.createNotification(
         assignedTo,
         `You have been assigned task: ${taskName}`,
         "TASK_ASSIGNMENT"
      );
   }

   console.log("Task created with ID:", taskResult.insertId);
   return taskResult
}

const Getservice = async (currentUserId, currentUserRole, tenantId) => {
   console.log("Fetching tasks for currentUserId:", currentUserId, "role:", currentUserRole);
   const tasks = await model.Getmodel(currentUserId, currentUserRole, tenantId)
   console.log("tasks retrieved-----", tasks)
   return tasks
}

const Updateservice = async (updatedatas) => {
   console.log(updatedatas, "updating task")

   const normalizedData = normalizeTaskPayload(updatedatas);
   const taskName = normalizedData.taskName
   const status = normalizedData.status
   const priority = normalizedData.priority
   const startDate = normalizedData.startDate
   const assignedTo = normalizedData.assignedTo
   const tenantId = ensureTenantId(updatedatas.tenantId);
   const taskId = normalizedData.taskId || normalizedData.id;
   const existingTask = await model.GetTaskByIdmodel(taskId, tenantId);

   if (!existingTask) {
      if (await model.TaskExists(taskId)) {
         throw new ForbiddenTenantError();
      }

      throw new Error("TASK_NOT_FOUND");
   }

   const updateResult = await model.Updatemodel(
      taskName,
      status,
      priority,
      startDate,
      taskId,
      assignedTo,
      tenantId
   )

   const wasAssignedTo = existingTask?.assignedTo ?? null;
   if (assignedTo && String(assignedTo) !== String(wasAssignedTo)) {
      await notificationService.createNotification(
         assignedTo,
         `You have been assigned task: ${taskName}`,
         "TASK_ASSIGNMENT"
      );
   }

   return {
      task: updateResult,
      message: "Task updated successfully"
   }
}

const Deleteservice = async (taskId, tenantIdValue) => {
   const tenantId = ensureTenantId(tenantIdValue);
   const existingTask = await model.GetTaskByIdmodel(taskId, tenantId);

   if (!existingTask) {
      if (await model.TaskExists(taskId)) {
         throw new ForbiddenTenantError();
      }

      throw new Error("TASK_NOT_FOUND");
   }

   return await model.Deletemodel(taskId, tenantId)
}

module.exports = { Addservice, Getservice, Updateservice, Deleteservice }
