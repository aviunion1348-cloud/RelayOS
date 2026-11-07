ALTER TABLE users ADD CONSTRAINT users_id_organization_unique UNIQUE(id, organization_id);
ALTER TABLE tasks ADD COLUMN owner_id text;
ALTER TABLE tasks ADD COLUMN reviewer_id text;
ALTER TABLE tasks ADD CONSTRAINT tasks_owner_org_fk FOREIGN KEY(owner_id, organization_id) REFERENCES users(id, organization_id);
ALTER TABLE tasks ADD CONSTRAINT tasks_reviewer_org_fk FOREIGN KEY(reviewer_id, organization_id) REFERENCES users(id, organization_id);
CREATE INDEX tasks_owner_idx ON tasks(organization_id, owner_id);
