"""
import.py — load content/*.md into Supabase

Run:  python import.py
Re-running updates existing posts by slug; never duplicates.
"""

import re
import sys
from pathlib import Path

import yaml

from db import get_db, dict_cursor

CONTENT_DIR = Path("content")
VISUAL_RE   = re.compile(r"\[VISUAL:\s*(fig-\d+)\]")


def parse_file(path: Path) -> tuple[dict, str]:
    """Split a markdown file into (frontmatter dict, body string)."""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        raise ValueError(f"{path}: missing YAML frontmatter")
    _, fm_raw, body = text.split("---", 2)
    return yaml.safe_load(fm_raw), body.strip()


def find_or_create_source(cur, title: str) -> int:
    # INSERT ... ON CONFLICT DO NOTHING leaves the row unchanged if title exists.
    # The SELECT then fetches whichever row (old or new) owns that title.
    cur.execute(
        "INSERT INTO sources (title) VALUES (%(title)s) ON CONFLICT (title) DO NOTHING",
        {"title": title},
    )
    cur.execute("SELECT id FROM sources WHERE title = %(title)s", {"title": title})
    return cur.fetchone()["id"]


def upsert_post(cur, source_id: int, fm: dict, body: str) -> int:
    # True upsert: INSERT on first import, UPDATE on re-import.
    # ON CONFLICT(slug) targets the UNIQUE constraint so slug is never duplicated.
    # updated_at is refreshed every run; created_at is left untouched.
    cur.execute(
        """
        INSERT INTO posts
            (source_id, chapter_number, title, slug, summary, body, status)
        VALUES
            (%(source_id)s, %(chapter)s, %(title)s, %(slug)s,
             %(summary)s, %(body)s, %(status)s)
        ON CONFLICT (slug) DO UPDATE SET
            source_id      = EXCLUDED.source_id,
            chapter_number = EXCLUDED.chapter_number,
            title          = EXCLUDED.title,
            summary        = EXCLUDED.summary,
            body           = EXCLUDED.body,
            status         = EXCLUDED.status,
            updated_at     = NOW()
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
    cur.execute("SELECT id FROM posts WHERE slug = %(slug)s", {"slug": fm["slug"]})
    return cur.fetchone()["id"]


def upsert_figures(cur, post_id: int, figures: dict) -> None:
    # UNIQUE(post_id, marker) means ON CONFLICT targets the exact (post, marker) pair.
    for order, (marker, meta) in enumerate(figures.items(), start=1):
        cur.execute(
            """
            INSERT INTO figures
                (post_id, marker, caption, alt_text, image_path, sort_order)
            VALUES
                (%(post_id)s, %(marker)s, %(caption)s,
                 %(alt_text)s, %(image_path)s, %(sort_order)s)
            ON CONFLICT (post_id, marker) DO UPDATE SET
                caption    = EXCLUDED.caption,
                alt_text   = EXCLUDED.alt_text,
                image_path = EXCLUDED.image_path,
                sort_order = EXCLUDED.sort_order
            """,
            {
                "post_id":    post_id,
                "marker":     marker,
                "caption":    meta.get("caption", ""),
                "alt_text":   meta.get("alt", ""),
                "image_path": meta.get("image"),
                "sort_order": order,
            },
        )


def warn_missing_figures(path: Path, body: str, figures: dict) -> None:
    for match in VISUAL_RE.finditer(body):
        marker = match.group(1)
        if marker not in figures:
            print(
                f"  WARNING {path.name}: [VISUAL: {marker}] has no frontmatter entry",
                file=sys.stderr,
            )


def import_file(cur, path: Path) -> None:
    fm, body   = parse_file(path)
    figures    = fm.get("figures") or {}

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

    con = get_db()
    try:
        with con:
            cur = dict_cursor(con)
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
