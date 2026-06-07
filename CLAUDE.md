# CLAUDE.md

## What this project is

A personal learning blog. I'm working through technical books from first
principles and proving I understood each chapter by writing a plain-language
explainer for it — the Feynman technique. The style reference is the
3Blue1Brown lessons page: short, readable sections with hand-made visuals.
The first source is *Fundamentals of Physics* (Halliday, Resnick & Walker),
one post per chapter.

AI assistance is for digesting sources and tightening my drafts. It does **not**
write the explainers for me — writing them is how the learning happens.

## How content flows

```
content/*.md  →  import.py  →  blog.db (SQLite)  →  Flask renders pages
                                                 ↑
                              visuals/<slug>/fig_N.py  →  generate.py
                              (matplotlib figures saved to static/figures/)
```

Markdown is the source of truth for text. The `visuals/` scripts are the
source of truth for generated figures. Both feed the database.

## Architecture

### 1. Data layer — SQLite (`blog.db`)
Schema in `schema.sql`. Three tables:
- `sources` — the books being worked through
- `posts` — one explainer per chapter (`slug` is the URL and primary key)
- `figures` — one row per `[VISUAL: fig-n]` marker; `image_path` is null until generated

### 2. Reading layer — Flask (`app.py`)
Two routes:
- `/` — index: published posts grouped by source, ordered by chapter
- `/<slug>` — post page: markdown → HTML, KaTeX math, figures rendered

### 3. Authoring layer — CLI scripts
- `import.py` — upsert `content/*.md` into the database (idempotent, match on slug)
- `publish.py <slug>` — flip status → published, stamp published_at
- `generate.py [slug] [fig-n]` — render matplotlib figure scripts → PNG,
  update `figures.image_path` in DB

### 4. Visualization engine — `visuals/`
- `visuals/theme.py` — brand constants and matplotlib helpers
- `visuals/<slug>/fig_N.py` — one file per figure; each exports `draw(out: Path)`
- Output: `static/figures/<slug>/fig-n.png` (path relative to `static/`)
- Not all figures are implemented; `generate.py` skips missing scripts cleanly

## Stack (confirmed)
- **Framework:** Python + Flask
- **DB:** SQLite (file-based, raw SQL — no ORM)
- **Templating:** Jinja2
- **Markdown → HTML:** Python-Markdown
- **Math:** KaTeX (client-side auto-render)
- **Figures:** matplotlib + numpy (static PNGs)

## Repo layout

```
CLAUDE.md               ← this file
schema.sql              ← SQLite DDL (source of truth)
requirements.txt        ← Flask, PyYAML, Markdown, matplotlib, numpy
blog.db                 ← gitignored; recreate with: sqlite3 blog.db < schema.sql

app.py                  ← Flask app (two routes)
import.py               ← markdown → database upsert
publish.py              ← CLI: flip post status
generate.py             ← CLI: render figure scripts → PNG + update DB

content/
  01-measurement.md     ← Chapter 1 (published)

docs/
  PLAN.md               ← phased build plan
  CONTENT_FORMAT.md     ← markdown file spec

visuals/
  theme.py              ← brand: purple #6B21A8/#A855F7, black #0A0A0A, white #F9F9F9
  measurement/          ← figures for the "measurement" post
    fig_3.py            ← tree diagram: base → derived quantities  ✓
    fig_10.py           ← length-of-day time-series               ✓
    fig_16.py           ← metric prefix number line               ✓
    fig_19.py           ← pyramid: base units → all of physics    ✓
    fig_1..19.py        ← 15 others not yet implemented

templates/
  base.html             ← sticky nav, KaTeX, link to style.css
  index.html            ← hero, about, Feynman quote, searchable gallery
  post.html             ← dark reading layout

static/
  style.css             ← full stylesheet (dark brand theme)
  figures/
    measurement/        ← generated PNGs land here
```

## Brand

| Element  | Value                              |
|----------|------------------------------------|
| Primary  | Purple `#6B21A8` / `#A855F7`       |
| Secondary| Black `#0A0A0A`                    |
| Tertiary | White `#F9F9F9`                    |
| Tagline  | "Love is the Answer"               |

See `visuals/theme.py` for full figure spec (figsize, dpi, font sizes, arrow/label styles).

## Content conventions (full spec in docs/CONTENT_FORMAT.md)

Each post is one markdown file with YAML frontmatter (`title`, `slug`, `source`,
`chapter`, `summary`, `status`, `figures` map). In the body:
- `## Heading` — section (sentence case)
- `[VISUAL: fig-n]` — figure placeholder; renderer swaps for image or dashed placeholder
- `[PAUSE]` — display-only spacing beat; not stored in DB

## Common commands

```bash
# import / re-import all content
python import.py

# publish a post
python publish.py measurement

# generate all figures for a post (skips unimplemented)
python generate.py measurement

# generate one specific figure
python generate.py measurement fig-3

# run the dev server
python -m flask --app app.py run --port 5001
```

## Guardrails

- Keep it simple — no ORM, no auth, no admin UI until actually needed.
- Write raw SQL first; explain the queries as you go (learning SQL is a goal).
- Import is idempotent: re-running updates, never duplicates.
- `generate.py` skips figures with no script — never crashes on missing implementations.
- Only `status = 'published'` posts appear on the public site.

## Phase status

| Phase | Description              | Status      |
|-------|--------------------------|-------------|
| 1     | Scaffold + database      | ✅ Done      |
| 2     | Import script            | ✅ Done      |
| 3     | Reading layer            | ✅ Done      |
| 4     | Publish CLI              | ✅ Done      |
| 5     | Polish + deploy          | 🔄 Styling done · Deploy pending |
| —     | Visualization engine     | ✅ Engine done · 4/19 ch01 figures |

## Next up

- Deploy to Vercel (CLI authenticated, `vercel` command available)
- Remaining 15 figures for Chapter 1
- Write Chapter 2 content + figures
