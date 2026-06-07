"""
generate.py — render figures from visuals/<slug>/fig_N.py → static/figures/

Usage:
  python generate.py                     # all figures in DB
  python generate.py measurement         # all figures for one post
  python generate.py measurement fig-3   # one specific figure
"""

import importlib
import sqlite3
import sys
from pathlib import Path

DB_PATH    = Path("blog.db")
STATIC_DIR = Path("static") / "figures"


def marker_to_module(marker: str) -> str:
    # "fig-3" → "fig_3"
    return marker.replace("-", "_")


def generate_one(cur: sqlite3.Cursor, post_id: int, slug: str,
                 marker: str) -> bool:
    module_path = f"visuals.{slug}.{marker_to_module(marker)}"
    try:
        mod = importlib.import_module(module_path)
    except ModuleNotFoundError:
        print(f"  skip  {marker}: no script at {module_path}")
        return False

    out_dir = STATIC_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"{marker}.png"

    mod.draw(out_file)

    # image_path stored relative to static/ so Flask can serve /static/<path>
    rel = out_file.relative_to(Path("static"))
    cur.execute(
        "UPDATE figures SET image_path = ? WHERE post_id = ? AND marker = ?",
        (str(rel), post_id, marker),
    )
    print(f"  ok    {marker} → {out_file}")
    return True


def main() -> None:
    args = sys.argv[1:]
    slug_filter   = args[0] if len(args) >= 1 else None
    marker_filter = args[1] if len(args) >= 2 else None

    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")

    # Fetch the figures we need to generate.
    # Join posts so we have the slug; filter by slug and marker if given.
    query = """
        SELECT f.post_id, f.marker, p.slug
        FROM   figures f
        JOIN   posts   p ON p.id = f.post_id
        WHERE  1=1
    """
    params: list = []
    if slug_filter:
        query += " AND p.slug = ?"
        params.append(slug_filter)
    if marker_filter:
        query += " AND f.marker = ?"
        params.append(marker_filter)
    query += " ORDER BY p.slug, f.sort_order"

    rows = con.execute(query, params).fetchall()
    if not rows:
        print("No figures matched.")
        con.close()
        return

    cur = con.cursor()
    generated = 0
    for row in rows:
        if generate_one(cur, row["post_id"], row["slug"], row["marker"]):
            generated += 1

    con.commit()
    con.close()
    print(f"\nDone. {generated}/{len(rows)} figures generated.")


if __name__ == "__main__":
    main()
