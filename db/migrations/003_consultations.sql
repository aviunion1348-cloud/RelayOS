-- Additive client discovery records. Existing prospect records are unchanged.
ALTER TABLE prospects ADD CONSTRAINT prospects_id_organization_unique UNIQUE (id, organization_id);
CREATE TABLE consultations (
 id text PRIMARY KEY,
 organization_id text NOT NULL REFERENCES organizations(id),
 prospect_id text NOT NULL,
 created_by text NOT NULL REFERENCES users(id),
 title text NOT NULL,
 organization_details text NOT NULL DEFAULT '',
 infrastructure text NOT NULL DEFAULT '',
 hosting text NOT NULL DEFAULT '',
 engineering_team text NOT NULL DEFAULT '',
 existing_technology text NOT NULL DEFAULT '',
 operational_difficulties text NOT NULL DEFAULT '',
 business_requirements text NOT NULL DEFAULT '',
 product_opportunities text NOT NULL DEFAULT '',
 expected_results text NOT NULL DEFAULT '',
 technical_constraints text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (id, organization_id),
 FOREIGN KEY (prospect_id, organization_id) REFERENCES prospects(id, organization_id)
);
CREATE INDEX consultations_org_prospect_idx ON consultations(organization_id, prospect_id, created_at DESC);
CREATE TABLE requirements (
 id text PRIMARY KEY,
 organization_id text NOT NULL REFERENCES organizations(id),
 consultation_id text NOT NULL,
 created_by text NOT NULL REFERENCES users(id),
 title text NOT NULL,
 description text NOT NULL,
 status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Approved', 'Rejected')),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (consultation_id, organization_id) REFERENCES consultations(id, organization_id)
);
CREATE INDEX requirements_org_consultation_idx ON requirements(organization_id, consultation_id, created_at DESC);
