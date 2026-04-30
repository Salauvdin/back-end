INSERT INTO Permissions (menuName, Stutes, deletedata)
VALUES
  ('Dashboard', 1, 1),
  ('Teams', 1, 1),
  ('Team', 1, 1),
  ('Tasks', 1, 1),
  ('Task', 1, 1),
  ('Users', 1, 1),
  ('User', 1, 1),
  ('Task Users', 1, 1),
  ('Roles', 1, 1),
  ('Notifications', 1, 1)
ON DUPLICATE KEY UPDATE
  Stutes = VALUES(Stutes),
  deletedata = VALUES(deletedata);
