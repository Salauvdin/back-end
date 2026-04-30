const connection = require('../../../Connection');

const addRegistermodel = (registerName, registerEmail, registerRole, registerPassword, tenantId = 1) => {
  return new Promise((resolve, reject) => {
    console.log("MODEL INSERT:", { registerName, registerEmail, registerRole });

    const query = `
      INSERT INTO userTaskDetails (registerName, registerEmail, registerRole, registerPassword, tenantid) 
      VALUES (?, ?, ?, ?, ?)
    `;

    connection.dbconnection.query(
      query,
      [registerName, registerEmail, registerRole, registerPassword, tenantId],
      (err, res) => {
        if (err) {
          console.error("addRegistermodel error:", err);
          return reject(err);
        }
        console.log("Insert result:", res);
        return resolve(res);
      }
    );
  });
};

const getRegistermodel = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT registerId, registerName, registerEmail, registerRole 
      FROM userTaskDetails    
      WHERE deleteData = 1
    `;
    connection.dbconnection.query(query, (err, res) => {
      if (err) {
        console.error("getRegistermodel error:", err);
        return reject(err);
      }
      return resolve(res);
    });
  });
};

const updateRegistermodel = (registerName, registerEmail, registerRole, registerPassword, registerId) => {
  return new Promise((resolve, reject) => {
    let query;
    let params;

    if (registerPassword) {
      query = `
        UPDATE userTaskDetails 
        SET registerName = ?, registerEmail = ?, registerRole = ?, registerPassword = ? 
        WHERE registerId = ?
      `;
      params = [registerName, registerEmail, registerRole, registerPassword, registerId];
    } else {
      query = `
        UPDATE userTaskDetails 
        SET registerName = ?, registerEmail = ?, registerRole = ? 
        WHERE registerId = ?
      `;
      params = [registerName, registerEmail, registerRole, registerId];
    }

    connection.dbconnection.query(query, params, (err, res) => {
      if (err) {
        console.error("updateRegistermodel error:", err);
        return reject(err);
      }
      return resolve(res);
    });
  });
};

const deleteRegistermodel = (registerId) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE userTaskDetails SET deleteData = 0 WHERE registerId = ?`;
    connection.dbconnection.query(query, [registerId], (err, res) => {
      if (err) {
        console.error("deleteRegistermodel error:", err);
        return reject(err);
      }
      return resolve(res);
    });
  });
};

module.exports = {
  addRegistermodel,
  getRegistermodel,
  updateRegistermodel,
  deleteRegistermodel
};
