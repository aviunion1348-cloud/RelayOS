-- Retain the affected user for permission-change audit entries.
ALTER TABLE audits ADD COLUMN target_user_id text;
