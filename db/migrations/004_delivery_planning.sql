CREATE TABLE milestones (
 id text PRIMARY KEY,
 organization_id text NOT NULL REFERENCES organizations(id),
 project_id text NOT NULL,
 title text NOT NULL,
 description text NOT NULL DEFAULT '',
 created_by text NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id, organization_id, project_id),
 FOREIGN KEY(project_id, organization_id) REFERENCES projects(id, organization_id)
);
CREATE INDEX milestones_org_project_idx ON milestones(organization_id, project_id, created_at DESC);
CREATE TABLE delivery_modules (
 id text PRIMARY KEY,
 organization_id text NOT NULL REFERENCES organizations(id),
 project_id text NOT NULL,
 milestone_id text,
 title text NOT NULL,
 description text NOT NULL DEFAULT '',
 created_by text NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(project_id, organization_id) REFERENCES projects(id, organization_id),
 FOREIGN KEY(milestone_id, organization_id, project_id) REFERENCES milestones(id, organization_id, project_id)
);
CREATE INDEX delivery_modules_org_project_idx ON delivery_modules(organization_id, project_id, created_at DESC);
