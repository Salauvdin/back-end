const model = require("./UserTaskmodel")
const permissionService = require("./UserPermissionservice")
const bcrypt = require("bcryptjs")
const { ForbiddenTenantError, ensureTenantId } = require("../../../utils/tenantScope")

const assertUserTenantAccess = async (userId, currentUserId, currentUserRole, tenantId) => {
   const user = await model.GetUserById(userId, currentUserId, currentUserRole, tenantId)

   if (user) {
      return user
   }

   if (await model.UserExists(userId)) {
      throw new ForbiddenTenantError()
   }

   throw new Error("USER_NOT_FOUND")
}

const Addservice = async (addData) => {
   console.log("Service - Adding user:", addData.userName || addData.registerName, "CreatedBy:", addData.createdBy)
   const tenantId = ensureTenantId(addData.tenantId)

   const registerName = addData.userName || addData.registerName
   const registerEmail = addData.email || addData.registerEmail
   const registerRole = addData.userRole || addData.registerRole
   const timezone = addData.timezone || addData.userTimezone || "IST"

   if (!registerName || !registerEmail || !registerRole) {
      throw new Error("Missing required user fields: registerName, registerEmail, registerRole")
   }
   
   // Hash password
   const password = addData.registerPassword || addData.password || addData.userPassword || 'Temp123456'
   const hashedPassword = await bcrypt.hash(password, 10)
   console.log("Password hashed successfully")
   
   // Create the user
   const userResult = await model.Addmodel(
      registerName,
      registerEmail,
      registerRole,
      hashedPassword,
      addData.createdBy,
      timezone,
      tenantId
   )
   
   // Add permissions if provided
   if (userResult && userResult.insertId && addData.permissions && addData.permissions.length > 0) {
      await permissionService.addUserPermissions(userResult.insertId, addData.permissions, addData.createdBy)
      console.log(`Permissions added for registerId: ${userResult.insertId}`)
   }
   
   console.log(`User created successfully with registerId: ${userResult.insertId}`)
   return userResult
}

const Getservice = async (currentUserId, currentUserRole, tenantId) => {
   console.log(`Service - Getting users for user ${currentUserId} with role ${currentUserRole}`)
   
   const users = await model.Getmodel(currentUserId, currentUserRole, tenantId)
   console.log(`Retrieved ${users.length} users from database`)
   
   // Get permissions for each user
   const usersWithPermissions = await Promise.all(
      users.map(async (user) => {
         const permissions = await permissionService.getUserPermissions(user.registerId)
         return {
            ...user,
            timezone: user.timezone || "IST",
            permissions
         }
      })
   )
   
   return usersWithPermissions
}

const Updateservice = async (updatedatas) => {
   console.log("Service - Updating user:", updatedatas.userId || updatedatas.registerId)
   const timezone = updatedatas.timezone || updatedatas.userTimezone || null
   const tenantId = ensureTenantId(updatedatas.tenantId)
   
   // Hash password if provided
   let hashedPassword = null
   const password = updatedatas.registerPassword || updatedatas.password || updatedatas.userPassword
   if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
      console.log("Password hashed successfully for update")
   }
   
   // Update user data
   const updateResult = await model.Updatemodel(
      updatedatas.userName || updatedatas.registerName,
      updatedatas.email || updatedatas.registerEmail,
      updatedatas.userRole || updatedatas.registerRole,
      updatedatas.userId || updatedatas.registerId,
      hashedPassword,
      timezone,
      tenantId
   )
   
   // Update permissions if provided
   if (updatedatas.permissions && (updatedatas.userId || updatedatas.registerId)) {
      const userId = updatedatas.userId || updatedatas.registerId
      await permissionService.updateUserPermissions(userId, updatedatas.permissions, updatedatas.createdBy)
      console.log(`Permissions updated for registerId: ${userId}`)
   }
   
   console.log(`User ${updatedatas.userId || updatedatas.registerId} updated successfully`)
   return updateResult
}

const Deleteservice = async (taskId, tenantId) => {
   ensureTenantId(tenantId)
   console.log(`Service - Deleting user ${taskId}`)
   
   // Delete user permissions first
   await permissionService.deleteUserPermissions(taskId)
   console.log(`Permissions deleted for registerId: ${taskId}`)
   
   // Soft delete the user
   const result = await model.Deletemodel(taskId, tenantId)
   console.log(`User ${taskId} deleted successfully`)
   return result
}

module.exports = { Addservice, Getservice, Updateservice, Deleteservice, assertUserTenantAccess }
