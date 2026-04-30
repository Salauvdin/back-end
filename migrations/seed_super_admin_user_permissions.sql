DELETE FROM UserPermissions
WHERE userId = 19;

INSERT INTO UserPermissions (userId, menuName, canRead, canWrite, canDelete, createdBy)
VALUES
  (19, '*', 1, 1, 1, 19),
  (19, 'Dashboard', 1, 1, 1, 19),
  (19, 'Design UI', 1, 1, 1, 19),
  (19, 'Teams', 1, 1, 1, 19),
  (19, 'Team', 1, 1, 1, 19),
  (19, 'Tasks', 1, 1, 1, 19),
  (19, 'Task', 1, 1, 1, 19),
  (19, 'Users', 1, 1, 1, 19),
  (19, 'User', 1, 1, 1, 19),
  (19, 'Task Users', 1, 1, 1, 19),
  (19, 'Roles', 1, 1, 1, 19),
  (19, 'Notifications', 1, 1, 1, 19);
