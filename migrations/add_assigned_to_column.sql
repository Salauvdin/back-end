-- Add assignedTo column to taskDetails table
-- Migration: Add task assignment functionality

ALTER TABLE taskDetails 
ADD COLUMN assignedTo VARCHAR(255) NULL 
AFTER createdBy;

-- Add index for better query performance on assignedTo
CREATE INDEX idx_taskdetails_assigned_to ON taskDetails(assignedTo);

-- Optional: Add foreign key constraint if you have a users table
-- Uncomment and modify based on your actual users table structure
-- ALTER TABLE taskDetails 
-- ADD CONSTRAINT fk_taskdetails_assigned_to 
-- FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL;
