/* -------------------------------------------------------------------------- */
/*  SCHEMA                                                                    */
/* -------------------------------------------------------------------------- */

CREATE SCHEMA IF NOT EXISTS analytics;

/* -------------------------------------------------------------------------- */
/*  TABLES                                                                    */
/* -------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS analytics.visits (
	id uuid NOT NULL,
	event_id uuid NOT NULL,
	link_id uuid NOT NULL,
	user_id text NOT NULL,
	ip text,
	country char(2),
	referer text,
	user_agent_raw text,
	user_agent jsonb,
	is_bot boolean NOT NULL DEFAULT false,
	visited_at timestamptz NOT NULL
);

/* -------------------------------------------------------------------------- */
/*  CONSTRAINTS                                                               */
/* -------------------------------------------------------------------------- */

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint c
		JOIN pg_namespace n ON n.oid = c.connamespace
		WHERE c.conname = 'pk_visits'
		  AND n.nspname = 'analytics'
	) THEN
		ALTER TABLE analytics.visits ADD CONSTRAINT pk_visits PRIMARY KEY (id);
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint c
		JOIN pg_namespace n ON n.oid = c.connamespace
		WHERE c.conname = 'uq_visits_event_id'
		  AND n.nspname = 'analytics'
	) THEN
		ALTER TABLE analytics.visits ADD CONSTRAINT uq_visits_event_id UNIQUE (event_id);
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint c
		JOIN pg_namespace n ON n.oid = c.connamespace
		WHERE c.conname = 'chk_visits_country'
		  AND n.nspname = 'analytics'
	) THEN
		ALTER TABLE analytics.visits
			ADD CONSTRAINT chk_visits_country
			CHECK (country IS NULL OR country ~ '^[A-Z]{2}$');
	END IF;
END$$;

/* -------------------------------------------------------------------------- */
/*  INDEXES                                                                   */
/* -------------------------------------------------------------------------- */

CREATE INDEX IF NOT EXISTS idx_visits_link_id ON analytics.visits (link_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON analytics.visits (user_id);
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON analytics.visits (visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_link_id_visited_at ON analytics.visits (link_id, visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_is_bot ON analytics.visits (is_bot);
CREATE INDEX IF NOT EXISTS idx_visits_country ON analytics.visits (country);
