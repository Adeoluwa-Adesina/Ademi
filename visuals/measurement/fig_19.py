"""
fig-19: pyramid — meter, second, kilogram at the base; all of physics above.
"""

from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from visuals.theme import (
    BLACK, WHITE, PURPLE_DEEP, PURPLE_ACCENT, GRAY,
    setup_figure, add_watermark,
)


def draw(out: Path) -> None:
    fig, ax = setup_figure()
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis("off")

    # Pyramid defined by three horizontal bands
    # Each band is a trapezoid. Bottom is widest.
    bands = [
        # (y_bottom, y_top, left_x_bottom, right_x_bottom, label, sublabel, bg, fg)
        (1.0, 3.2,  1.0,  9.0, "BASE UNITS", "Meter · Second · Kilogram",
         PURPLE_DEEP,   WHITE),
        (3.2, 5.8,  2.2,  7.8, "DERIVED QUANTITIES", "Speed · Force · Energy · Power · ...",
         "#3B0764",     WHITE),
        (5.8, 7.8,  3.2,  6.8, "PHYSICAL LAWS", "F = ma  ·  E = mc²  ·  ...",
         "#1E0338",     PURPLE_ACCENT),
        (7.8, 9.2,  4.2,  5.8, "ALL OF\nPHYSICS", "",
         "#0A0A0A",     PURPLE_ACCENT),
    ]

    for y0, y1, x0, x1, label, sublabel, bg, fg in bands:
        # trapezoid vertices (bottom-left, bottom-right, top-right, top-left)
        # top of pyramid narrows — compute top x proportionally
        total_h = 9.2 - 1.0
        frac_top = (y1 - 1.0) / total_h
        frac_bot = (y0 - 1.0) / total_h
        apex_x = 5.0

        top_left  = apex_x - (1 - frac_top) * (apex_x - 1.0)
        top_right = apex_x + (1 - frac_top) * (9.0  - apex_x)
        bot_left  = apex_x - (1 - frac_bot) * (apex_x - 1.0)
        bot_right = apex_x + (1 - frac_bot) * (9.0  - apex_x)

        xs = [bot_left, bot_right, top_right, top_left]
        ys = [y0,       y0,        y1,         y1]
        poly = mpatches.Polygon(list(zip(xs, ys)),
                                closed=True, facecolor=bg,
                                edgecolor=PURPLE_ACCENT, linewidth=2.0,
                                zorder=2)
        ax.add_patch(poly)

        mid_y = (y0 + y1) / 2
        ax.text(5, mid_y + 0.15, label,
                ha="center", va="center",
                fontsize=13, fontweight="bold", color=fg,
                linespacing=1.5, zorder=3)
        if sublabel:
            ax.text(5, mid_y - 0.45, sublabel,
                    ha="center", va="center",
                    fontsize=9, color=fg, alpha=0.75,
                    zorder=3)

    ax.set_title("The foundation of mechanics",
                 fontsize=20, fontweight="bold", color=WHITE, pad=4, y=0.98)

    add_watermark(ax)
    fig.savefig(out, dpi=180, bbox_inches="tight", facecolor=BLACK)
    plt.close(fig)
