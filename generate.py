"""
generate.py — render figures from visuals/<slug>/fig_N.py → static/figures/

Usage:
  python generate.py                     # all figures in DB
  python generate.py measurement         # all figures for one post
  python generate.py measurement fig-3   # one specific figure
"""

import importlib
import sys
from pathlib import Path

from db import get_db, dict_cursor

STATIC_DIR = Path("static") / "figures"


def marker_to_module(marker: str) -> str:
    # "fig-3" → "fig_3"
    return marker.replace("-", "_")


def generate_one(cur, post_id: int, slug: str, marker: str) -> bool:
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
        """
        UPDATE figures
        SET    image_path = %(image_path)s
        WHERE  post_id = %(post_id)s AND marker = %(marker)s
        """,
        {"image_path": str(rel), "post_id": post_id, "marker": marker},
    )
    print(f"  ok    {marker} → {out_file}")
    return True


def main() -> None:
    args = sys.argv[1:]
    slug_filter   = args[0] if len(args) >= 1 else None
    marker_filter = args[1] if len(args) >= 2 else None

    con = get_db()

    query = """
        SELECT f.post_id, f.marker, p.slug
        FROM   figures f
        JOIN   posts   p ON p.id = f.post_id
        WHERE  1=1
    """
    params: dict = {}
    if slug_filter:
        query += " AND p.slug = %(slug)s"
        params["slug"] = slug_filter
    if marker_filter:
        query += " AND f.marker = %(marker)s"
        params["marker"] = marker_filter
    query += " ORDER BY p.slug, f.sort_order"

    cur = dict_cursor(con)
    cur.execute(query, params)
    rows = cur.fetchall()

    if not rows:
        con.close()
        print("No figures matched.")
        return

    generated = 0
    with con:
        for row in rows:
            if generate_one(cur, row["post_id"], row["slug"], row["marker"]):
                generated += 1

    con.close()
    print(f"\nDone. {generated}/{len(rows)} figures generated.")


if __name__ == "__main__":
    main()
