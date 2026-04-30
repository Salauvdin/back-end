const { dbconnection } = require('../../../Connection');
const EXCLUDED_MENUS = new Set(["Permissions"]);
const SUPER_ADMIN_MENUS = [
  "View Dashboard",
  "Tasks",
  "Reports",
  "User Management",
  "Configuration",
  "Permissions"
];
const SUPER_ADMIN_USER_ID = 19;

const buildFullAccessPermissions = (menus) => menus.map((menu) => ({
  menu,
  read: 1,
  write: 1,
  fullAccess: 1
}));

// Add user permissions
const addUserPermissions = async (userId, permissions, createdBy = null) => {
  console.log("Adding permissions for registerId:", userId, "Permissions count:", permissions?.length, "CreatedBy:", createdBy);
  
  if (!permissions || permissions.length === 0) {
    console.log("No permissions provided, skipping...");
    return;
  }
  
  const filteredPermissions = permissions.filter((perm) => !EXCLUDED_MENUS.has(perm?.menu));

  for (const perm of filteredPermissions) {
    await new Promise((resolve, reject) => {
      const query = `
        INSERT INTO UserPermissions (userId, menuName, canRead, canWrite, canDelete, createdBy)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [userId, perm.menu, perm.read ? 1 : 0, perm.write ? 1 : 0, perm.fullAccess ? 1 : 0, createdBy];
      
      dbconnection.query(query, values, (err, result) => {
        if (err) {
          console.error("Permission insert error:", err);
          reject(err);
        } else {
          console.log(`Permission inserted for menu: ${perm.menu}`);
          resolve(result);
        }
      });
    });
  }
  console.log("All permissions added successfully for userId:", userId);
};

// Get user permissions
const getUserPermissions = async (userId) => {
  console.log("Getting permissions for userId:", userId);

  if (Number(userId) === SUPER_ADMIN_USER_ID) {
    return buildFullAccessPermissions(SUPER_ADMIN_MENUS);
  }
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        menuName AS menu,
        canRead AS \`read\`,
        canWrite AS \`write\`,
        canDelete AS fullAccess
      FROM UserPermissions
      WHERE userId = ?
      AND menuName NOT IN (?)
    `;
    dbconnection.query(query, [userId, Array.from(EXCLUDED_MENUS)], (err, results) => {
      if (err) {
        console.error("Get permissions error:", err);
        reject(err);
      } else {
        console.log(`Retrieved ${results.length} permissions for userId: ${userId}`);
        resolve(results || []);
      }
    });
  });
}

const getAllPermissions = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT menuName AS menu
      FROM Permissions
      WHERE deletedata = 1
      AND menuName NOT IN (?)
    `;

    dbconnection.query(query, [Array.from(EXCLUDED_MENUS)], (err, results) => {
      if (err) {
        console.error("Get all permissions error:", err);
        reject(err);
      } else {
        const permissions = buildFullAccessPermissions((results || []).map((permission) => permission.menu));

        const existingMenus = new Set(permissions.map((permission) => permission.menu));
        for (const menu of SUPER_ADMIN_MENUS) {
          if (!existingMenus.has(menu)) {
            permissions.push(...buildFullAccessPermissions([menu]));
          }
        }

        resolve(permissions);
      }
    });
  });
}

// Update user permissions
const updateUserPermissions = async (userId, permissions, createdBy = null) => {
  console.log(`Updating permissions for userId: ${userId}`);
  
  // Delete old permissions
  await new Promise((resolve, reject) => {
    const query = `DELETE FROM UserPermissions WHERE userId = ?`;
    dbconnection.query(query, [userId], (err, result) => {
      if (err) {
        console.error("Delete old permissions error:", err);
        reject(err);
      } else {
        console.log(`Deleted ${result.affectedRows} old permissions`);
        resolve(result);
      }
    });
  });

  // Add new permissions
  await addUserPermissions(userId, permissions, createdBy);
  console.log(`Permissions updated successfully for userId: ${userId}`);
};

// Delete user permissions
const deleteUserPermissions = async (userId) => {
  console.log(`Deleting all permissions for userId: ${userId}`);
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM UserPermissions WHERE userId = ?`;
    dbconnection.query(query, [userId], (err, result) => {
      if (err) {
        console.error("Delete permissions error:", err);
        reject(err);
      } else {
        console.log(`Deleted ${result.affectedRows} permissions for userId: ${userId}`);
        resolve(result);
      }
    });
  });
};

module.exports = {
  addUserPermissions,
  getAllPermissions,
  getUserPermissions,
  updateUserPermissions,
  deleteUserPermissions
};
