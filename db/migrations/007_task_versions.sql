ALTER TABLE tasks ADD COLUMN version integer NOT NULL DEFAULT 0 CHECK(version >= 0);
