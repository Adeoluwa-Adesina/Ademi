# Build plan

## Definition of done (v1)

Chapter 1 ("Measurement") is written in `content/01-measurement.md`, imported
into SQLite, and viewable as a published page on the public site — section
headings rendered, math rendered, figures shown (or shown as labeled
placeholders where no image exists yet), with an index page linking to it.

## Do this first

Get one post visible end-to-end before building anything else. Resist features
until that works.

## Phases

1. **Scaffold + database.** Create the project skeleton for the chosen stack.
   Run `schema.sql` to create `blog.db`. Verify the seed rows load and you can
   query them (`SELECT * FROM posts;`).
2. **Import script.** Read every file in `content/*.md`, parse frontmatter +
   body, and upsert into `sources`, `posts`, and `figures`. Re-running it should
   *update* an existing post (match on `slug`), not create a duplicate. Warn if
   a `[VISUAL: fig-n]` in the body has no matching `fig-n` in frontmatter.
3. **Reading layer.** Public routes: an index listing published posts (grouped
   by source, ordered by `chapter_number`), and a post page. Render markdown →
   HTML, swap `[VISUAL: fig-n]` for the figure from the `figures` table, render
   KaTeX math, render `[PAUSE]` as spacing. Only `status = 'published'` appears.
4. **Author workflow.** A simple `publish` action (flip `status`, set
   `published_at`) — at first just a CLI flag or a tiny protected route. Confirm
   the draft/publish split actually hides drafts from the public site.
5. **Polish + deploy.** Styling pass toward a clean, readable, 3b1b-ish reading
   experience. Deploy somewhere public.

## Later (not v1)

- In-browser admin CRUD UI for editing posts and uploading figure images.
- Tags / cross-topic navigation.
- Migrate SQLite → Postgres if it ever genuinely needs it.

## Decisions to confirm before scaffolding

- **Stack:** Python/Flask (recommended) vs Node/Express vs other.
- **Figure images:** once a visual is drawn, store it under a `static/` folder
  and record the path in `figures.image_path` (simple default).
- **Admin auth:** skip for v1 (publish via CLI) or a single password — decide
  when you reach Phase 4, not before.
