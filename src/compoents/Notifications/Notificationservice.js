const model = require("./Notificationmodel");

const createNotification = async (userId, message, type) => {
  if (!userId || !message) {
    return null;
  }

  return model.createNotification(userId, message, type || "GENERAL");
};

const getNotifications = async (userId, limit = 20, offset = 0) => {
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 20;
  const safeOffset = Number.isFinite(Number(offset)) ? Number(offset) : 0;

  return model.getNotificationsByUserId(userId, safeLimit, safeOffset);
};

const markAsRead = async (id, userId) => {
  return model.markNotificationAsRead(id, userId);
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead
};
