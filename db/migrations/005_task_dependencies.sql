ALTER TABLE tasks ADD CONSTRAINT tasks_id_org_project_unique UNIQUE(id, organization_id, project_id);
CREATE TABLE task_dependencies (
 organization_id text NOT NULL REFERENCES organizations(id),
 project_id text NOT NULL,
 task_id text NOT NULL,
 depends_on_id text NOT NULL,
 created_by text NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(task_id, depends_on_id),
 CHECK(task_id <> depends_on_id),
 FOREIGN KEY(task_id, organization_id, project_id) REFERENCES tasks(id, organization_id, project_id),
 FOREIGN KEY(depends_on_id, organization_id, project_id) REFERENCES tasks(id, organization_id, project_id)
);
CREATE INDEX task_dependencies_project_idx ON task_dependencies(organization_id, project_id, task_id);
