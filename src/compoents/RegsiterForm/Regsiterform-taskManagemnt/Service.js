const bcrypt = require("bcryptjs");
const registermodel = require("./Model");

const addRegisterservice = async (addregisterdata) => {
  console.log("=== ADD REGISTER SERVICE ===");
  console.log("Received data:", JSON.stringify(addregisterdata, null, 2));

  // ✅ Validate all required fields before doing anything
  const {
    registerName,
    registerEmail,
    registerPassword,
    registerRole,
    tenantId = 1
  } = addregisterdata;

  if (!registerName || !registerEmail || !registerPassword || !registerRole) {
    throw new Error(
      `Missing required fields. Received: name=${registerName}, email=${registerEmail}, role=${registerRole}, password=${registerPassword ? '***' : 'MISSING'}`
    );
  }

  // ✅ Hash password
  const hashedPassword = await bcrypt.hash(registerPassword, 10);
  console.log("Password hashed successfully for:", registerEmail);

  const result = await registermodel.addRegistermodel(
    registerName,
    registerEmail,
    registerRole,
    hashedPassword,
    tenantId
  );

  console.log("User created with ID:", result.insertId);
  return result;
};

const getRegisterservice = async () => {
  const result = await registermodel.getRegistermodel();
  console.log("Users fetched:", result.length);
  return result;
};

const updateRegisterservice = async (updatedata) => {
  console.log("=== UPDATE REGISTER SERVICE ===");
  console.log("Received data:", JSON.stringify(updatedata, null, 2));

  let hashedPassword = null;

  // ✅ Only hash if a new password was actually provided
  if (updatedata.registerPassword) {
    hashedPassword = await bcrypt.hash(updatedata.registerPassword, 10);
    console.log("Password hashed for update");
  }

  const result = await registermodel.updateRegistermodel(
    updatedata.registerName,
    updatedata.registerEmail,
    updatedata.registerRole,
    hashedPassword,
    updatedata.registerId
  );

  console.log("User updated:", result);
  return result;
};

const deleteRegisterservice = async (deleteData) => {
  console.log("=== DELETE REGISTER SERVICE ===");
  console.log("Deleting registerId:", deleteData.registerId);

  // ✅ Fixed: was incorrectly returning the function reference instead of the result
  const result = await registermodel.deleteRegistermodel(deleteData.registerId);
  console.log("User soft-deleted:", result);
  return result;
};

module.exports = {
  addRegisterservice,
  getRegisterservice,
  updateRegisterservice,
  deleteRegisterservice
};
