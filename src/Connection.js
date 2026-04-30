const mysql = require("mysql2")

const dbconnection = mysql.createPool({
      host: "localhost",
      user: "root",
      port: 3306,
      password: "1234",
      database: "myproject",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
})

// Add query method to pool
dbconnection.query = function(query, values, callback) {
  if (typeof values === 'function') {
    callback = values;
    values = undefined;
  }
  
  // If callback provided, use callback-based pattern
  if (typeof callback === 'function') {
    this.getConnection((err, connection) => {
      if (err) {
        return callback(err);
      }
      
      connection.query(query, values, (error, results) => {
        connection.release();
        callback(error, results);
      });
    });
    return;
  }
  
  // Otherwise, return a promise
  return new Promise((resolve, reject) => {
    this.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      
      connection.query(query, values, (error, results) => {
        connection.release();
        if (error) reject(error);
        else resolve(results);
      });
    });
  });
}

module.exports= {dbconnection} ;




// const mysql2 =require("mysql2")
 
//   const dbconnection =mysql2.createConnection({
//     host:"localhost",
//     port:3005,
//     password:"sala18",
//     database:"sala",
//     user:"root"

//   })
//   module.exports={dbconnection}



// const mysql2 = require("mysql2")

// const dbconnection1 =mysql2.createConnection({
//              host:
//              port:
//              user:
//              database:
//              password:
// })


// module.exports={dbconnection1}