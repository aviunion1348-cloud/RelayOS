-- Membership is scoped to one organization and project. No existing user is granted access.
CREATE TABLE project_view_memberships (
  organization_id text NOT NULL,
  project_id text NOT NULL,
  user_id text NOT NULL,
  granted_by text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, project_id, user_id),
  FOREIGN KEY (project_id, organization_id) REFERENCES projects(id, organization_id),
  FOREIGN KEY (user_id, organization_id) REFERENCES users(id, organization_id),
  FOREIGN KEY (granted_by, organization_id) REFERENCES users(id, organization_id)
);
