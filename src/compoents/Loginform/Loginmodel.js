const connection = require('../../Connection');

exports.findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {

    const query = `
      SELECT registerId, registerName, registerEmail, registerRole, registerPassword, tenantid, isSuperAdmin
      FROM userTaskDetails 
      WHERE registerEmail = ? AND deleteData = 1
      LIMIT 1
    `;

    connection.dbconnection.query(query, [email], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) return resolve(null);
      resolve(result[0]);
    });

  });
};
