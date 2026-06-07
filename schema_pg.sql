-- ============================================================
--  Learning-blog schema — PostgreSQL (Supabase)
--  Run with:  python setup_db.py
--  Source of truth for the hosted database.
-- ============================================================

-- sources : the books a post explains
CREATE TABLE IF NOT EXISTS sources (
    id         SERIAL PRIMARY KEY,
    title      TEXT        NOT NULL UNIQUE,   -- UNIQUE: safe find-or-create
    author     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- posts : one explainer per chapter
CREATE TABLE IF NOT EXISTS posts (
    id             SERIAL PRIMARY KEY,
    source_id      INTEGER REFERENCES sources(id),
    chapter_number INTEGER,
    title          TEXT        NOT NULL,
    slug           TEXT        NOT NULL UNIQUE,
    summary        TEXT,
    body           TEXT        NOT NULL DEFAULT '',
    status         TEXT        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft', 'published')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at   TIMESTAMPTZ
);

-- figures : each [VISUAL: fig-n] marker in a post
CREATE TABLE IF NOT EXISTS figures (
    id          SERIAL PRIMARY KEY,
    post_id     INTEGER     NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    marker      TEXT        NOT NULL,
    caption     TEXT        NOT NULL DEFAULT '',
    image_path  TEXT,
    alt_text    TEXT,
    sort_order  INTEGER     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (post_id, marker)
);

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_source ON posts (source_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_figures_post ON figures (post_id, sort_order);
