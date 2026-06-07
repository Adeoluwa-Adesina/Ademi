-- ============================================================
--  Learning-blog schema (SQLite)
--  Run with:  sqlite3 blog.db < schema.sql
--  Reminder:  foreign keys must be enabled per-connection:
--             PRAGMA foreign_keys = ON;
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
--  sources : the books / origins a post explains
--  (Start with one row: Fundamentals of Physics.)
-- ------------------------------------------------------------
CREATE TABLE sources (
    id          INTEGER PRIMARY KEY,            -- auto-increments
    title       TEXT    NOT NULL,               -- "Fundamentals of Physics"
    author      TEXT,                            -- "Halliday, Resnick & Walker"
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
--  posts : one explainer = one chapter
-- ------------------------------------------------------------
CREATE TABLE posts (
    id             INTEGER PRIMARY KEY,
    source_id      INTEGER REFERENCES sources(id),
    chapter_number INTEGER,                      -- orders the posts chapter by chapter
    title          TEXT    NOT NULL,             -- "Measurement"
    slug           TEXT    NOT NULL UNIQUE,      -- "measurement"  (URL handle)
    summary        TEXT,                          -- one line for the index card
    body           TEXT    NOT NULL DEFAULT '',  -- full markdown: ## headings + [VISUAL: fig-n] + [PAUSE]
    status         TEXT    NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft', 'published')),
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    published_at   TEXT                           -- NULL until you publish
);

-- ------------------------------------------------------------
--  figures : each [VISUAL: ...] marker in a post's body
--  image_path is NULL while the visual is still just a brief.
-- ------------------------------------------------------------
CREATE TABLE figures (
    id          INTEGER PRIMARY KEY,
    post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    marker      TEXT    NOT NULL,                 -- 'fig-1'; appears in body as [VISUAL: fig-1]
    caption     TEXT    NOT NULL,                 -- the description / art brief
    image_path  TEXT,                              -- NULL = not drawn yet (your to-do list)
    alt_text    TEXT,                              -- accessibility
    sort_order  INTEGER NOT NULL DEFAULT 0,        -- order within the post
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE (post_id, marker)                       -- one slot per marker per post
);

-- Helpful indexes for the queries you'll run most
CREATE INDEX idx_posts_status   ON posts (status);
CREATE INDEX idx_posts_source   ON posts (source_id, chapter_number);
CREATE INDEX idx_figures_post   ON figures (post_id, sort_order);

-- ============================================================
--  Seed: Chapter 1 mapped into the schema (example data)
-- ============================================================
INSERT INTO sources (id, title, author)
VALUES (1, 'Fundamentals of Physics', 'Halliday, Resnick & Walker');

INSERT INTO posts (id, source_id, chapter_number, title, slug, summary, status, body)
VALUES (
    1, 1, 1, 'Measurement', 'measurement',
    'How do we agree on what a meter, a second, or a kilogram actually is?',
    'draft',
    '## The problem of measurement' || char(10) || char(10) ||
    'Physics is about measuring the world. To measure something you need two things: a unit and a standard.' || char(10) || char(10) ||
    '[VISUAL: fig-1]' || char(10) || char(10) ||
    'Here''s the wild thing though — physicists pick a few base quantities and derive everything else from them.'
);

INSERT INTO figures (post_id, marker, caption, image_path, sort_order)
VALUES
    (1, 'fig-1', 'A ruler labeled "1 meter" with a big question mark — but what IS a meter, really?', NULL, 1);
