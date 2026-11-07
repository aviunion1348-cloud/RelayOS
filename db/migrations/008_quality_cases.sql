ALTER TABLE delivery_modules ADD CONSTRAINT delivery_modules_id_org_project_unique UNIQUE(id, organization_id, project_id);
ALTER TABLE requirements ADD CONSTRAINT requirements_id_organization_unique UNIQUE(id, organization_id);
CREATE TABLE qa_cases (
 id text PRIMARY KEY,
 organization_id text NOT NULL REFERENCES organizations(id),
 project_id text NOT NULL,
 module_id text NOT NULL,
 requirement_id text,
 title text NOT NULL,
 category text NOT NULL,
 risk text NOT NULL,
 preconditions text NOT NULL,
 input text NOT NULL,
 expected_result text NOT NULL,
 created_by text NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id,organization_id),
 FOREIGN KEY(module_id,organization_id,project_id) REFERENCES delivery_modules(id,organization_id,project_id),
 FOREIGN KEY(requirement_id,organization_id) REFERENCES requirements(id,organization_id)
);
CREATE UNIQUE INDEX qa_cases_distinct_title ON qa_cases(organization_id,module_id,lower(btrim(title)));
CREATE INDEX qa_cases_module_idx ON qa_cases(organization_id,module_id);
CREATE TABLE qa_results (
 id text PRIMARY KEY,
 organization_id text NOT NULL REFERENCES organizations(id),
 case_id text NOT NULL,
 outcome text NOT NULL CHECK(outcome IN ('Pass','Fail','Blocked','Not run','Skipped')),
 actual_result text NOT NULL,
 evidence_reference text NOT NULL DEFAULT '',
 build_version text NOT NULL,
 environment text NOT NULL,
 tester_id text NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(case_id,organization_id) REFERENCES qa_cases(id,organization_id)
);
CREATE INDEX qa_results_case_idx ON qa_results(organization_id,case_id,created_at DESC);
