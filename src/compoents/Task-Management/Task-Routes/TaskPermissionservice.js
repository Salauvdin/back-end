const { dbconnection } = require('../../../Connection');
const EXCLUDED_MENUS = new Set(["Permissions"]);
const SUPER_ADMIN_USER_ID = 19;
const SUPER_ADMIN_MENUS = [
  "View Dashboard",
  "Tasks",
  "Reports",
  "User Management",
  "Configuration",
  "Permissions"
];

const buildFullAccessPermissions = (menus) => menus.map((menu) => ({
  menu,
  read: 1,
  write: 1,
  fullAccess: 1
}));

// Add user permissions (registerId from userTaskDetails)
const addUserPermissions = async (userId, permissions, createdBy = null) => {
  console.log("Adding permissions for registerId:", userId, "Permissions:", permissions, "CreatedBy:", createdBy);
  
  if (!permissions || permissions.length === 0) {
    console.log("No permissions provided, skipping...");
    return;
  }
  
  const filteredPermissions = permissions.filter((perm) => !EXCLUDED_MENUS.has(perm?.menu));

  for (const perm of filteredPermissions) {
    console.log("Processing permission:", perm);
    await new Promise((resolve, reject) => {
      const query = `
        INSERT INTO UserPermissions (userId, menuName, canRead, canWrite, canDelete, createdBy)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [
        userId,
        perm.menu,
        perm.read ? 1 : 0,
        perm.write ? 1 : 0,
        perm.fullAccess ? 1 : 0,
        createdBy
      ];
      console.log("Query:", query, "Values:", values);
      
      dbconnection.query(query, values, (err, result) => {
        if (err) {
          console.error("Permission insert error:", err);
          reject(err);
        } else {
          console.log("Permission inserted successfully:", result);
          resolve(result);
        }
      });
    });
  }
  console.log("All permissions added successfully");
};

// Get user permissions
const getUserPermissions = async (userId) => {
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
      if (err) reject(err);
      else resolve(results || []);
    });
  });
};

// Update user permissions
const updateUserPermissions = async (userId, permissions, createdBy = null) => {
  // Delete old permissions
  await new Promise((resolve, reject) => {
    const query = `DELETE FROM UserPermissions WHERE userId = ?`;
    dbconnection.query(query, [userId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

  // Add new permissions
  await addUserPermissions(userId, permissions, createdBy);
};

// Delete user permissions
const deleteUserPermissions = async (userId) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM UserPermissions WHERE userId = ?`;
    dbconnection.query(query, [userId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

module.exports = {
  addUserPermissions,
  getUserPermissions,
  updateUserPermissions,
  deleteUserPermissions
};
