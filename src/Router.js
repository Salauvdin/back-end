// Router.js - Complete fixed version

const express = require("express");
const router = express.Router();

const controller = require("./compoents/Employeeform/controller");
const Addregisterform = require("./compoents/RegsiterForm/Registercontroller");
const Rolecontroller = require("./compoents/Crud-task/Crud-Role/Rolecontroller");
const Taskcontroller = require("./compoents/Task-Management/Task-Routes/Taskcontroller");
const Usercontroller = require("./compoents/Task-Management/User-Routes/UserTaskcontroller");
const loginController = require('./compoents/Loginform/Logincontroller');
const PermissionsController = require("./compoents/Permissons/Controller");
const registerController = require("./compoents/RegsiterForm/Regsiterform-taskManagemnt/Controller");
const Notificationcontroller = require("./compoents/Notifications/Notificationcontroller");
const TeamController = require("./compoents/Team-Management/teamController");
const TenantsController = require("./compoents/tenants/tenantsController");
const authMiddleware = require('./Middleware');

const requireSuperAdmin = (req, res, next) => {
  if (!req.user?.isSuperAdmin) {
    return res.status(403).json({ message: "Super admin permission required" });
  }

  return next();
};

// ── Public Routes (No middleware) ────────────────────────────────
router.post("/v1/signup", registerController.addRegistercontroller);
router.post("/v1/login", loginController.loginController);


// ✅ IMPORTANT: Apply middleware for all routes below this line
router.use(authMiddleware);

router.get("/v1/getUser", (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

// ── Protected Tenant Routes ──────────────────────────────────────
router.post("/tenants", requireSuperAdmin, TenantsController.createTenant);
router.get("/tenants", requireSuperAdmin, TenantsController.getTenants);
router.get("/tenants/:id", requireSuperAdmin, TenantsController.getTenant);
router.patch("/tenants/:id", requireSuperAdmin, TenantsController.updateTenant);
router.delete("/tenants/:id", requireSuperAdmin, TenantsController.deleteTenant);

// ── Protected Team Routes ────────────────────────────────────────
router.post("/teams", TeamController.createTeam);
router.patch("/teams/:id", TeamController.updateTeam);
router.delete("/teams/:id", TeamController.deleteTeam);
router.get("/teams", TeamController.getTeams);
router.get("/teams/:id/comments", TeamController.getTeamComments);
router.get("/teams/:id", TeamController.getTeamById);
router.get("/teams/:id/tasks", TeamController.getTeamTasks);
router.get("/teams/:id/users", TeamController.getTeamUsers);


// ── Register Users Routes ────────────────────────────────────────
router.get("/v1/getRegisterUsers", Addregisterform.getRegistercontroller);
router.patch("/v1/updateRegisterUser/:id", Addregisterform.updateRegistercontroller);
router.patch("/v1/deleteRegisterUser/:id", Addregisterform.deleteRegistercontroller);

// ── User Management Routes ✅ Make sure controller methods exist ─
router.post("/v1/addTaskUser", Usercontroller.Addcontroller);       // POST method
router.get("/v1/gettaskUser", Usercontroller.Getcontroller);        // GET method  
router.patch("/v1/updatetaskUser/:id", Usercontroller.Updatecontroller); // PATCH method
router.patch("/v1/deletetaskUser/:id", Usercontroller.Deletecontroller); // PATCH method
// ── Task Management Routes ───────────────────────────────────────
router.post("/v1/addTask", Taskcontroller.Addcontroller);
router.get("/v1/getTask", Taskcontroller.Getcontroller);
router.patch("/v1/updateTask/:id", Taskcontroller.Updatecontroller);
router.patch("/v1/deleteTask/:id", Taskcontroller.Deletecontroller);

// ── Notification Routes ──────────────────────────────────────────
router.get("/v1/notifications", Notificationcontroller.Getcontroller);
router.get("/api/notifications/user/:userId", Notificationcontroller.GetByUsercontroller);
router.patch("/v1/notifications/read/:id", Notificationcontroller.Readcontroller);

// ── Roles Routes ─────────────────────────────────────────────────
router.post("/v1/addRole", Rolecontroller.Addcontroller);
router.get("/v1/getRole", Rolecontroller.Getcontroller);
router.patch("/v1/updateRole/:id", Rolecontroller.Updatecontroller);
router.patch("/v1/deleteRole/:id", Rolecontroller.Deletecontroller);

// ── Employee Form Routes ─────────────────────────────────────────
router.post("/v1/addData", controller.Addcontroller);
router.get("/v1/getData", controller.Getcontroller);
router.patch("/v1/updateData", controller.Updatecontroller);
router.patch("/v1/deleteData", controller.Deletecontroller);

// ── Permissions Routes ───────────────────────────────────────────
router.post("/v1/addStutes", PermissionsController.Addcontroller);
router.get("/v1/getStutes", PermissionsController.Getcontroller);
router.patch("/v1/updateStutes/:id", PermissionsController.Updatecontroller);
router.patch("/v1/deleteStutes/:id", PermissionsController.Deletecontroller);

module.exports = router; // ✅ Export only router, not { router }
