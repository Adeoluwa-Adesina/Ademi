"""
publish.py — flip a post from draft to published (or back to draft)

Usage:
  python publish.py <slug>              # publish
  python publish.py <slug> --unpublish  # revert to draft
"""

import sys

from db import get_db, dict_cursor


def main() -> None:
    args = sys.argv[1:]
    if not args:
        print("Usage: python publish.py <slug> [--unpublish]")
        sys.exit(1)

    slug       = args[0]
    unpublish  = "--unpublish" in args
    new_status = "draft" if unpublish else "published"

    con = get_db()
    cur = dict_cursor(con)

    cur.execute(
        "SELECT id, status FROM posts WHERE slug = %(slug)s",
        {"slug": slug},
    )
    row = cur.fetchone()
    if row is None:
        con.close()
        print(f"No post found with slug '{slug}'")
        sys.exit(1)

    if row["status"] == new_status:
        con.close()
        print(f"'{slug}' is already {new_status}.")
        return

    # Set status and published_at together.
    # published_at is cleared when reverting to draft so the timestamp is
    # accurate if the post is later re-published.
    with con:
        cur.execute(
            """
            UPDATE posts
            SET    status       = %(status)s,
                   published_at = CASE WHEN %(status)s = 'published' THEN NOW() ELSE NULL END,
                   updated_at   = NOW()
            WHERE  slug = %(slug)s
            """,
            {"status": new_status, "slug": slug},
        )

    con.close()
    verb = "published" if not unpublish else "reverted to draft"
    print(f"'{slug}' {verb}.")


if __name__ == "__main__":
    main()
