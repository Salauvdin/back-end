try {
  console.log("Testing Connection...");
  const conn = require('./src/Connection');
  console.log("Connection loaded:", !!conn, Object.keys(conn));
} catch (e) {
  console.error("Connection error:", e.message);
}

try {
  console.log("\nTesting Loginmodel...");
  const model = require('./src/compoents/Loginform/Loginmodel');
  console.log("Loginmodel loaded:", !!model, Object.keys(model));
} catch (e) {
  console.error("Loginmodel error:", e.message);
}

try {
  console.log("\nTesting Loginservice...");
  const service = require('./src/compoents/Loginform/Loginservice');
  console.log("Loginservice loaded:", !!service, Object.keys(service));
} catch (e) {
  console.error("Loginservice error:", e.message);
}

try {
  console.log("\nTesting Logincontroller...");
  const controller = require('./src/compoents/Loginform/Logincontroller');
  console.log("Logincontroller loaded:", !!controller, Object.keys(controller));
  console.log("loginController function exists:", typeof controller.loginController);
} catch (e) {
  console.error("Logincontroller error:", e.message);
}
