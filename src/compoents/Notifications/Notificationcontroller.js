const service = require("./Notificationservice");

const Getcontroller = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.user?.registerId || req.user?.userId;
    const limit = req.query.limit ?? 20;
    const offset = req.query.offset ?? 0;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await service.getNotifications(currentUserId, limit, offset);
    return res.status(200).json({
      message: "Notifications retrieved successfully",
      value: notifications
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const GetByUsercontroller = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.user?.registerId || req.user?.userId;
    const requestedUserId = req.params.userId;
    const limit = req.query.limit ?? 20;
    const offset = req.query.offset ?? 0;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (String(currentUserId) !== String(requestedUserId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const notifications = await service.getNotifications(requestedUserId, limit, offset);
    return res.status(200).json({
      message: "Notifications retrieved successfully",
      value: notifications
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const Readcontroller = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.user?.registerId || req.user?.userId;
    const notificationId = req.params.id;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!notificationId) {
      return res.status(400).json({ message: "Missing required field: id" });
    }

    const result = await service.markAsRead(notificationId, currentUserId);
    return res.status(200).json({
      message: "Notification marked as read",
      value: result
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  Getcontroller,
  GetByUsercontroller,
  Readcontroller
};
