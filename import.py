"""
import.py — load content/*.md into blog.db

Run:  python import.py
Re-running updates existing posts by slug; never duplicates.
"""

import re
import sqlite3
import sys
from pathlib import Path

import yaml

CONTENT_DIR = Path("content")
DB_PATH = Path("blog.db")

VISUAL_RE = re.compile(r"\[VISUAL:\s*(fig-\d+)\]")


def parse_file(path: Path) -> tuple[dict, str]:
    """Split a markdown file into (frontmatter dict, body string)."""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        raise ValueError(f"{path}: missing YAML frontmatter")
    _, fm_raw, body = text.split("---", 2)
    return yaml.safe_load(fm_raw), body.strip()


def find_or_create_source(cur: sqlite3.Cursor, title: str) -> int:
    # Look up by title first — we never want two rows for the same book.
    # INSERT OR IGNORE leaves the row unchanged if the title already exists;
    # the SELECT then fetches whichever row (old or new) owns that title.
    cur.execute(
        "INSERT OR IGNORE INTO sources (title) VALUES (?)",
        (title,),
    )
    cur.execute("SELECT id FROM sources WHERE title = ?", (title,))
    return cur.fetchone()[0]


def upsert_post(cur: sqlite3.Cursor, source_id: int, fm: dict, body: str) -> int:
    # INSERT OR REPLACE would delete and re-insert (losing created_at and the id).
    # Instead we do a true upsert:
    #   - INSERT … ON CONFLICT(slug) DO UPDATE … sets only the fields we own,
    #     leaving created_at and id untouched.
    # updated_at is refreshed on every import run so we can see when content changed.
    cur.execute(
        """
        INSERT INTO posts
            (source_id, chapter_number, title, slug, summary, body, status)
        VALUES
            (:source_id, :chapter, :title, :slug, :summary, :body, :status)
        ON CONFLICT(slug) DO UPDATE SET
            source_id      = excluded.source_id,
            chapter_number = excluded.chapter_number,
            title          = excluded.title,
            summary        = excluded.summary,
            body           = excluded.body,
            status         = excluded.status,
            updated_at     = datetime('now')
        """,
        {
            "source_id": source_id,
            "chapter":   fm["chapter"],
            "title":     fm["title"],
            "slug":      fm["slug"],
            "summary":   fm.get("summary", ""),
            "body":      body,
            "status":    fm.get("status", "draft"),
        },
    )
    cur.execute("SELECT id FROM posts WHERE slug = ?", (fm["slug"],))
    return cur.fetchone()[0]


def upsert_figures(cur: sqlite3.Cursor, post_id: int, figures: dict) -> None:
    # For each figure in frontmatter, upsert into figures.
    # The UNIQUE(post_id, marker) constraint means ON CONFLICT targets
    # the exact (post, marker) pair — safe to re-run any number of times.
    for order, (marker, meta) in enumerate(figures.items(), start=1):
        cur.execute(
            """
            INSERT INTO figures
                (post_id, marker, caption, alt_text, image_path, sort_order)
            VALUES
                (:post_id, :marker, :caption, :alt_text, :image_path, :sort_order)
            ON CONFLICT(post_id, marker) DO UPDATE SET
                caption    = excluded.caption,
                alt_text   = excluded.alt_text,
                image_path = excluded.image_path,
                sort_order = excluded.sort_order
            """,
            {
                "post_id":    post_id,
                "marker":     marker,
                "caption":    meta.get("caption", ""),
                "alt_text":   meta.get("alt", ""),
                "image_path": meta.get("image"),  # None when image: null
                "sort_order": order,
            },
        )


def warn_missing_figures(path: Path, body: str, figures: dict) -> None:
    """Warn for any [VISUAL: fig-n] in the body with no frontmatter entry."""
    for match in VISUAL_RE.finditer(body):
        marker = match.group(1)
        if marker not in figures:
            print(f"  WARNING {path.name}: [VISUAL: {marker}] has no frontmatter entry",
                  file=sys.stderr)


def import_file(cur: sqlite3.Cursor, path: Path) -> None:
    fm, body = parse_file(path)
    figures = fm.get("figures") or {}

    warn_missing_figures(path, body, figures)

    source_id = find_or_create_source(cur, fm["source"])
    post_id   = upsert_post(cur, source_id, fm, body)
    upsert_figures(cur, post_id, figures)

    print(f"  imported: {fm['slug']} ({len(figures)} figures)")


def main() -> None:
    files = sorted(CONTENT_DIR.glob("*.md"))
    if not files:
        print("No markdown files found in content/")
        return

    con = sqlite3.connect(DB_PATH)
    con.execute("PRAGMA foreign_keys = ON")

    try:
        with con:  # commits on success, rolls back on exception
            cur = con.cursor()
            for path in files:
                import_file(cur, path)
    except Exception as exc:
        print(f"Import failed: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        con.close()

    print("Done.")


if __name__ == "__main__":
    main()
