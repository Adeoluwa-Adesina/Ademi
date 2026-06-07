# Content format

Each explainer is one markdown file in `content/`, named `NN-slug.md`
(e.g. `01-measurement.md`). The import script reads these into the database.

## Frontmatter (YAML)

```yaml
---
title: Measurement
slug: measurement
source: Fundamentals of Physics
chapter: 1
summary: One line shown on the index card.
status: draft              # draft | published
figures:
  fig-1:
    caption: What the visual shows / the art brief.
    alt: Short accessibility description.
    image: null            # path under static/ once drawn; null = not made yet
  fig-2:
    caption: ...
    alt: ...
    image: null
---
```

How it maps to the database:

- `source` → find-or-create a row in `sources`.
- the remaining top-level fields → a row in `posts`, matched on `slug`.
- each `figures` entry → a row in `figures`: the key (`fig-1`) becomes `marker`,
  plus `caption`, `alt_text`, and `image_path` (`null` until the visual exists).

## Body

Plain markdown, plus two custom tokens:

- `## Section heading` — a section. Sentence case.
- `[VISUAL: fig-1]` — placeholder, on its own line, where figure `fig-1`
  (defined in frontmatter) is shown. The renderer swaps it for the image, or a
  labeled placeholder if `image` is null.
- `[PAUSE]` — a display-only beat; renders as extra spacing. Not stored in the DB.

Math uses LaTeX delimiters for KaTeX: `$...$` inline, `$$...$$` block.

## Rules

- Every `[VISUAL: fig-n]` in the body must have a matching `fig-n` in
  frontmatter (the import script should warn on mismatches).
- `slug` is unique across all posts — it's the URL.
- A post stays `draft` until you flip it to `published`.
