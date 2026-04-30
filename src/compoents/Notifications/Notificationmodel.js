const connection = require("../../Connection");

const createNotification = async (userId, message, type) => {
  const query = `
    INSERT INTO notifications (userId, message, type)
    VALUES (?, ?, ?)
  `;

  return connection.dbconnection.query(query, [userId, message, type]);
};

const getNotificationsByUserId = async (userId, limit, offset) => {
  const query = `
    SELECT id, userId, message, type, isRead, createdAt
    FROM notifications
    WHERE userId = ?
    ORDER BY createdAt DESC, id DESC
    LIMIT ? OFFSET ?
  `;

  return connection.dbconnection.query(query, [userId, limit, offset]);
};

const markNotificationAsRead = async (id, userId) => {
  const query = `
    UPDATE notifications
    SET isRead = TRUE
    WHERE id = ? AND userId = ?
  `;

  return connection.dbconnection.query(query, [id, userId]);
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  markNotificationAsRead
};
