"""
publish.py — flip a post from draft to published (or back to draft)

Usage:
  python publish.py <slug>            # publish
  python publish.py <slug> --unpublish  # revert to draft
"""

import sqlite3
import sys
from pathlib import Path

DB_PATH = Path("blog.db")


def main() -> None:
    args = sys.argv[1:]
    if not args:
        print("Usage: python publish.py <slug> [--unpublish]")
        sys.exit(1)

    slug      = args[0]
    unpublish = "--unpublish" in args
    new_status = "draft" if unpublish else "published"

    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")

    row = con.execute("SELECT id, status FROM posts WHERE slug = ?", (slug,)).fetchone()
    if row is None:
        print(f"No post found with slug '{slug}'")
        con.close()
        sys.exit(1)

    if row["status"] == new_status:
        print(f"'{slug}' is already {new_status}.")
        con.close()
        return

    # Set status and published_at together.
    # published_at is cleared when reverting to draft so the timestamp is
    # accurate if the post is later re-published.
    con.execute(
        """
        UPDATE posts
        SET    status       = ?,
               published_at = CASE WHEN ? = 'published' THEN datetime('now') ELSE NULL END,
               updated_at   = datetime('now')
        WHERE  slug = ?
        """,
        (new_status, new_status, slug),
    )
    con.commit()
    con.close()

    verb = "published" if not unpublish else "reverted to draft"
    print(f"'{slug}' {verb}.")


if __name__ == "__main__":
    main()
