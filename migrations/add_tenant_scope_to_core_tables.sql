-- Required for strict multi-tenant isolation.
-- Backfill tenantid before making these columns NOT NULL in existing databases.

ALTER TABLE userTaskDetails
  ADD COLUMN tenantid INT NULL AFTER registerPassword;

ALTER TABLE taskDetails
  ADD COLUMN tenantid INT NULL AFTER assignedTo;

ALTER TABLE teams
  ADD COLUMN tenantid INT NULL AFTER comments;

CREATE INDEX idx_usertaskdetails_tenantid ON userTaskDetails(tenantid);
CREATE INDEX idx_taskdetails_tenantid ON taskDetails(tenantid);
CREATE INDEX idx_teams_tenantid ON teams(tenantid);

-- After backfilling existing rows, enforce:
-- ALTER TABLE userTaskDetails MODIFY tenantid INT NOT NULL;
-- ALTER TABLE taskDetails MODIFY tenantid INT NOT NULL;
-- ALTER TABLE teams MODIFY tenantid INT NOT NULL;
