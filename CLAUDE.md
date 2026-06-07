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

Markdown is the source of truth. I write each explainer as a markdown file in
`content/`. An import step loads those files into a SQLite database. The public
website reads from the database and renders the pages:

```
content/*.md  →  import script  →  blog.db (SQLite)  →  web app renders pages
```

This keeps the writing in plain files I own and version in git, while still
doing real SQL underneath — learning the SQL is one of the goals of the project.

## Architecture (three layers)

1. **Data layer** — SQLite. Schema is in `schema.sql` (already written).
   Tables: `sources`, `posts`, `figures`.
2. **Reading layer (public)** — lists topics and renders each *published* post:
   markdown → HTML, math via KaTeX, figures pulled from the `figures` table.
3. **Authoring layer** — for v1 this is the markdown files plus the import
   script (create/update a post = edit the file and re-import). An in-browser
   admin CRUD UI is a later stretch goal, **not** v1.

## Recommended stack

- **Language/framework:** Python + Flask (minimal, server-rendered, the SQL
  stays visible). Swap for Node/Express if preferred — only the build commands
  change, not the architecture.
- **DB:** SQLite (file-based, real SQL).
- **Templating:** Jinja2.
- **Markdown → HTML:** Python-Markdown (or markdown-it-py).
- **Math:** KaTeX, client-side.

Confirm this before scaffolding — see `docs/PLAN.md` → "Decisions to confirm".

## Repo layout

```
CLAUDE.md
schema.sql              # SQLite DDL — source of truth for the database
docs/
  PLAN.md               # phased build plan + definition of done
  CONTENT_FORMAT.md     # how an explainer markdown file is structured
content/
  01-measurement.md     # first real post (Chapter 1)
```

## Content conventions (full spec in docs/CONTENT_FORMAT.md)

Each post is one markdown file with YAML frontmatter (`title`, `slug`, `source`,
`chapter`, `summary`, `status`, and a `figures:` map). In the body:

- `## Heading` marks a section (sentence case).
- `[VISUAL: fig-n]` is a placeholder where a figure goes; its caption/alt/image
  live in the frontmatter `figures` map.
- `[PAUSE]` is a display-only beat (renders as spacing); it is **not** stored in
  the database.

The renderer must replace `[VISUAL: fig-n]` with the figure (or a labeled
"not drawn yet" placeholder when its image is null) and `[PAUSE]` with spacing.

## Guardrails

- Keep it simple. The goal is shipping explainers, not a perfect CMS. Don't add
  a framework, ORM, or auth system unless v1 actually needs it.
- Ship one post end-to-end (Chapter 1, published, visible publicly) **before**
  adding any other feature.
- Write raw SQL for the core operations at least once before reaching for an
  ORM — learning the SQL is a project goal.
