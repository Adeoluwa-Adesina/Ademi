"""
app.py — public reading layer

Routes:
  /           → index: published posts grouped by source, ordered by chapter
  /<slug>     → post page: markdown rendered, math via KaTeX, figures swapped in
"""

import re
import sqlite3
from pathlib import Path

import markdown
from flask import Flask, abort, render_template

app = Flask(__name__)
# Anchor to __file__ so the path works on Vercel (CWD is not guaranteed)
DB_PATH = Path(__file__).parent / "blog.db"

VISUAL_RE = re.compile(r"\[VISUAL:\s*(fig-\d+)\]")
PAUSE_RE  = re.compile(r"\[PAUSE\]")


def get_db() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row   # lets us access columns by name
    con.execute("PRAGMA foreign_keys = ON")
    return con


def render_body(body: str, figures: dict[str, sqlite3.Row]) -> str:
    """
    1. Replace [PAUSE] with an HTML spacer.
    2. Replace [VISUAL: fig-n] with the figure block (image or placeholder).
    3. Convert the remaining markdown to HTML.

    We do the token replacements before markdown conversion so the custom
    tokens never accidentally get mangled by the markdown parser.
    """
    body = PAUSE_RE.sub('<div class="pause"></div>', body)

    def figure_html(match: re.Match) -> str:
        marker = match.group(1)
        fig = figures.get(marker)
        if fig is None:
            return f'<div class="figure figure--missing"><span>[{marker} — no figure data]</span></div>'
        if fig["image_path"]:
            img = f'<img src="/static/{fig["image_path"]}" alt="{fig["alt_text"] or ""}">'
        else:
            img = f'<div class="figure__placeholder">[ {marker} — not drawn yet ]</div>'
        caption = f'<p class="figure__caption">{fig["caption"]}</p>' if fig["caption"] else ""
        return f'<figure class="figure">{img}{caption}</figure>'

    body = VISUAL_RE.sub(figure_html, body)

    # markdown() converts **bold**, headings, paragraphs, etc.
    return markdown.markdown(body, extensions=["extra"])


@app.route("/")
def index():
    # Fetch all published posts, joined with their source title, ordered so
    # chapters run in order within each source.
    # We group them in Python (simple dict) rather than using SQL GROUP BY
    # because SQLite doesn't support returning grouped arrays natively.
    con = get_db()
    rows = con.execute(
        """
        SELECT p.slug, p.title, p.summary, p.chapter_number,
               s.title AS source_title
        FROM   posts p
        JOIN   sources s ON s.id = p.source_id
        WHERE  p.status = 'published'
        ORDER  BY s.title, p.chapter_number
        """
    ).fetchall()
    con.close()

    grouped: dict[str, list] = {}
    for row in rows:
        grouped.setdefault(row["source_title"], []).append(row)

    return render_template("index.html", grouped=grouped)


@app.route("/<slug>")
def post(slug: str):
    con = get_db()

    # Single query for the post — only published posts are visible.
    row = con.execute(
        """
        SELECT p.id, p.title, p.summary, p.body, p.chapter_number,
               s.title AS source_title
        FROM   posts p
        JOIN   sources s ON s.id = p.source_id
        WHERE  p.slug = ? AND p.status = 'published'
        """,
        (slug,),
    ).fetchone()

    if row is None:
        con.close()
        abort(404)

    # Fetch all figures for this post, keyed by marker for O(1) lookup.
    fig_rows = con.execute(
        """
        SELECT marker, caption, alt_text, image_path
        FROM   figures
        WHERE  post_id = ?
        ORDER  BY sort_order
        """,
        (row["id"],),
    ).fetchall()
    con.close()

    figures = {f["marker"]: f for f in fig_rows}
    html_body = render_body(row["body"], figures)

    return render_template("post.html", post=row, body_html=html_body)
