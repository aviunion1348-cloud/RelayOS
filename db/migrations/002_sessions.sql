-- Additive local identity checkpoint: existing users and operational records are preserved.
CREATE TABLE user_sessions (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES organizations(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX user_sessions_expires_at_idx ON user_sessions(expires_at);
