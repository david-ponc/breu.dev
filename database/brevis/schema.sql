/* -------------------------------------------------------------------------- */
/*  SCHEMA                                                                    */
/* -------------------------------------------------------------------------- */

CREATE SCHEMA IF NOT EXISTS brevis;

/* -------------------------------------------------------------------------- */
/*  ENUMS                                                                     */
/* -------------------------------------------------------------------------- */

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_type t
		JOIN pg_namespace n ON n.oid = t.typnamespace
		WHERE t.typname = 'link_status'
		  AND n.nspname = 'brevis'
	) THEN
		CREATE TYPE brevis.link_status AS ENUM (
			'active',
			'disabled',
			'draft'
		);
	END IF;
END$$;

/* -------------------------------------------------------------------------- */
/*  TABLES                                                                    */
/* -------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS brevis.links (
	id uuid NOT NULL,
	user_id text NOT NULL,
	slug varchar(18) NOT NULL,
	url text NOT NULL,
	comments text,
	meta jsonb,
	status brevis.link_status NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now()
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
		WHERE c.conname = 'pk_links'
		  AND n.nspname = 'brevis'
	) THEN
		ALTER TABLE brevis.links ADD CONSTRAINT pk_links PRIMARY KEY (id);
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint c
		JOIN pg_namespace n ON n.oid = c.connamespace
		WHERE c.conname = 'uq_links_slug'
		  AND n.nspname = 'brevis'
	) THEN
		ALTER TABLE brevis.links ADD CONSTRAINT uq_links_slug UNIQUE (slug);
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint c
		JOIN pg_namespace n ON n.oid = c.connamespace
		WHERE c.conname = 'chk_links_slug_length'
		  AND n.nspname = 'brevis'
	) THEN
		ALTER TABLE brevis.links
			ADD CONSTRAINT chk_links_slug_length
			CHECK (length(slug) BETWEEN 3 AND 18);
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint c
		JOIN pg_namespace n ON n.oid = c.connamespace
		WHERE c.conname = 'chk_links_url_protocol'
		  AND n.nspname = 'brevis'
	) THEN
		ALTER TABLE brevis.links
			ADD CONSTRAINT chk_links_url_protocol
			CHECK (url ~* '^https?://');
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint c
		JOIN pg_namespace n ON n.oid = c.connamespace
		WHERE c.conname = 'fk_links_user'
		  AND n.nspname = 'brevis'
	) THEN
		ALTER TABLE brevis.links
			ADD CONSTRAINT fk_links_user
			FOREIGN KEY (user_id)
			REFERENCES auth."user" (id)
			ON DELETE CASCADE;
	END IF;
END$$;

/* -------------------------------------------------------------------------- */
/*  INDEXES                                                                   */
/* -------------------------------------------------------------------------- */

CREATE INDEX IF NOT EXISTS idx_links_user_id ON brevis.links (user_id);
CREATE INDEX IF NOT EXISTS idx_links_status ON brevis.links (status);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON brevis.links (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_user_id_status ON brevis.links (user_id, status);

/* -------------------------------------------------------------------------- */
/*  TRIGGERS                                                                  */
/* -------------------------------------------------------------------------- */

CREATE OR REPLACE FUNCTION brevis.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_links_updated_at ON brevis.links;

CREATE TRIGGER trg_links_updated_at
	BEFORE UPDATE ON brevis.links
	FOR EACH ROW
	EXECUTE FUNCTION brevis.set_updated_at();
