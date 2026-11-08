-- Existing accounts retain their roles and remain active. New accounts must not default to admin.
ALTER TABLE users ADD COLUMN is_active boolean NOT NULL DEFAULT true;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'viewer';
