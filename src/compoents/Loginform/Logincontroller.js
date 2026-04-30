const authService = require("./Loginservice");
const permissionService = require("../Task-Management/User-Routes/UserPermissionservice");

const SUPER_ADMIN_PERMISSIONS = [
  "View Dashboard",
  "Tasks",
  "Reports",
  "User Management",
  "Tenant Management",
  "Configuration",
  "Permissions"
].map((menu) => ({
  menu,
  read: true,
  write: true,
  fullAccess: true,
  canRead: true,
  canWrite: true,
  canDelete: true
}));

const normalizePermission = (permission) => {
  const read = Boolean(permission.read ?? permission.canRead);
  const write = Boolean(permission.write ?? permission.canWrite);
  const fullAccess = Boolean(permission.fullAccess ?? permission.canDelete);

  return {
    menu: permission.menu,
    read,
    write,
    fullAccess,
    canRead: read,
    canWrite: write,
    canDelete: fullAccess
  };
};

exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Authenticate user
    const result = await authService.loginUser(email, password);
    
    // Get user permissions from database
    let permissions = [];
    if (result.user && result.user.id) {
      try {
        if (result.user.isSuperAdmin) {
          permissions = SUPER_ADMIN_PERMISSIONS;
        } else {
          permissions = await permissionService.getUserPermissions(result.user.id);
        }
        permissions = permissions.map(normalizePermission);
        console.log(`✅ Permissions loaded for user ${result.user.id}:`, permissions.length);
      } catch (permError) {
        console.error("❌ Error loading permissions:", permError.message);
        permissions = [];
      }
    }
    
    // Return response with token, user, and permissions
    return res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
      role: result.user.role,
      userId: result.user.id,
      isSuperAdmin: result.user.isSuperAdmin,
      permissions: permissions
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err.message);

    if (err.message === "USER_NOT_FOUND") {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (err.message === "INVALID_PASSWORD") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    if (err.message === "TENANT_NOT_ASSIGNED") {
      return res.status(403).json({
        success: false,
        message: "User is not assigned to a tenant"
      });
    }

    return res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};
