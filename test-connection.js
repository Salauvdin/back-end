const { dbconnection } = require('./src/Connection');

console.log("dbconnection object keys:", Object.keys(dbconnection));
console.log("typeof dbconnection.query:", typeof dbconnection.query);

// Test callback-based call
dbconnection.query("SELECT 1", (err, results) => {
  if (err) {
    console.log("Callback error:", err.message);
  } else {
    console.log("Callback success:", results);
  }
});

// Test promise-based call
dbconnection.query("SELECT 1")
  .then(results => {
    console.log("Promise success:", results);
  })
  .catch(err => {
    console.log("Promise error:", err.message);
  });
