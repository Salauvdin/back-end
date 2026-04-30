const registerService = require("./Service");

const addRegistercontroller = async (req, res) => {
  try {
    const registerData = {
      ...req.body,
      registerName: req.body.registerName ?? req.body.userName,
      registerEmail: req.body.registerEmail ?? req.body.email,
      registerPassword: req.body.registerPassword ?? req.body.password ?? req.body.userPassword,
      registerRole: req.body.registerRole ?? req.body.userRole,
      tenantId: req.body.tenantId ?? req.body.tenantid
    };
    console.log("ADD REGISTER - received data:", registerData);

    // Validate required fields
    if (!registerData.registerName || !registerData.registerEmail || 
        !registerData.registerPassword || !registerData.registerRole) {
      return res.status(400).json({
        message: "All fields are required: registerName, registerEmail, registerPassword, registerRole",
        received: registerData
      });
    }

    const result = await registerService.addRegisterservice(registerData);
    return res.status(200).json({
      message: "User registered successfully",
      data: result
    });
  } catch (err) {
    console.error("ADD REGISTER ERROR:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: "Email already exists. Please use a different email."
      });
    }
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const getRegistercontroller = async (req, res) => {
  try {
    const result = await registerService.getRegisterservice();
    return res.status(200).json({
      message: "Users retrieved successfully",
      data: result
    });
  } catch (err) {
    console.error("GET REGISTER ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const updateRegistercontroller = async (req, res) => {
  try {
    const updateData = req.body;
    console.log("UPDATE REGISTER - received data:", updateData);

    if (!updateData.registerId) {
      return res.status(400).json({ message: "registerId is required" });
    }

    const result = await registerService.updateRegisterservice(updateData);
    return res.status(200).json({
      message: "User updated successfully",
      data: result
    });
  } catch (err) {
    console.error("UPDATE REGISTER ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const deleteRegistercontroller = async (req, res) => {
  try {
    const registerId = req.params.id;
    console.log("DELETE REGISTER - userId:", registerId);

    if (!registerId) {
      return res.status(400).json({ message: "registerId is required" });
    }

    const result = await registerService.deleteRegisterservice({ registerId });
    return res.status(200).json({
      message: "User deleted successfully",
      data: result
    });
  } catch (err) {
    console.error("DELETE REGISTER ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

module.exports = {
  addRegistercontroller,
  getRegistercontroller,
  updateRegistercontroller,
  deleteRegistercontroller
};
