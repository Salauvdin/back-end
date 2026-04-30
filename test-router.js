const fs = require('fs');
const path = require('path');

// Read Router.js and get line 73
const routerPath = '/home/salauvdin/Documents/back-end/src/Router.js';
const content = fs.readFileSync(routerPath, 'utf8');
const lines = content.split('\n');

console.log("=== Lines 70-75 of Router.js ===");
for (let i = 69; i < 75; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

console.log("\n=== Testing Router load ===");
try {
  require('./src/Router');
  console.log("Router loaded successfully!");
} catch (e) {
  console.error("Error loading Router:", e.message);
  console.error("Stack:", e.stack);
}
