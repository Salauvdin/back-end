const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("./Loginmodel");

const SUPER_ADMIN_USER_ID = 19;

exports.loginUser = async (email, password) => {

  const user = await authModel.findUserByEmail(email);

  if (!user) throw new Error("Invalid credentials");

  console.log("User found:", user);
  console.log("Stored password hash from DB:", user.registerPassword);
  const isMatch = await bcrypt.compare(password, user.registerPassword);
  // console.log("bcrypt password match result:", isMatch);

  if (!isMatch) throw new Error("INVALID_PASSWORD");

  const isSuperAdmin = Boolean(user.isSuperAdmin) || Number(user.registerId) === SUPER_ADMIN_USER_ID;
  const tenantId = user.tenantid ?? (isSuperAdmin ? 0 : null);

  if (tenantId === null || tenantId === undefined || tenantId === "" || (!isSuperAdmin && Number(tenantId) === 0)) {
    throw new Error("TENANT_NOT_ASSIGNED");
  }

  const token = jwt.sign(
    {
      userId: user.registerId,
      id: user.registerId,
      role: user.registerRole,
      isSuperAdmin,
      tenantId,
    },
    process.env.JWT_SECRET || "mysecretkey",
    { expiresIn: "24h" } // Extended to 24 hours
  );

  return {
    token,
    user: {
      id: user.registerId,      // ✅ Important: Include user ID for permissions
      name: user.registerName,
      email: user.registerEmail,
      role: user.registerRole,
      tenantId,
      isSuperAdmin
    }
  };
};
