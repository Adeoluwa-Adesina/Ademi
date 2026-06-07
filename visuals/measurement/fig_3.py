"""
fig-3: tree diagram — Length, Time, Mass at the roots branching up to
Speed, Energy, Power.
"""

from pathlib import Path
import matplotlib.pyplot as plt
from visuals.theme import (
    BLACK, WHITE, PURPLE_DEEP, PURPLE_ACCENT, GRAY,
    setup_figure, add_watermark, draw_node, draw_box, draw_arrow,
)


# Which bases feed each derived quantity
CONNECTIONS = {
    "SPEED\nL · T⁻¹":    ["LENGTH", "TIME"],
    "ENERGY\nM · L² · T⁻²": ["LENGTH", "TIME", "MASS"],
    "POWER\nM · L² · T⁻³":  ["LENGTH", "TIME", "MASS"],
}

BASE_POSITIONS = {
    "LENGTH": (2.0, 2.2),
    "TIME":   (5.0, 2.2),
    "MASS":   (8.0, 2.2),
}

DERIVED_POSITIONS = {
    "SPEED\nL · T⁻¹":        (2.0, 7.2),
    "ENERGY\nM · L² · T⁻²":  (5.0, 7.2),
    "POWER\nM · L² · T⁻³":   (8.0, 7.2),
}


def draw(out: Path) -> None:
    fig, ax = setup_figure()
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis("off")

    # title
    ax.text(5, 9.2, "Three roots. Everything else is derived.",
            ha="center", va="center", fontsize=20, fontweight="bold",
            color=WHITE)

    # connecting lines (draw first so nodes sit on top)
    for derived_label, bases in CONNECTIONS.items():
        dx, dy = DERIVED_POSITIONS[derived_label]
        for base_label in bases:
            bx, by = BASE_POSITIONS[base_label]
            ax.plot([bx, dx], [by + 0.55, dy - 0.45],
                    color=GRAY, linewidth=1.4, alpha=0.7,
                    zorder=1)

    # base nodes
    for label, (x, y) in BASE_POSITIONS.items():
        draw_node(ax, x, y, label, fontsize=12)

    # derived boxes
    for label, (x, y) in DERIVED_POSITIONS.items():
        draw_box(ax, x, y, label, fontsize=11)

    # section labels
    ax.text(0.3, 2.2, "BASE", ha="left", va="center",
            fontsize=9, color=PURPLE_ACCENT, alpha=0.7, fontstyle="italic")
    ax.text(0.3, 7.2, "DERIVED", ha="left", va="center",
            fontsize=9, color=PURPLE_ACCENT, alpha=0.7, fontstyle="italic")

    add_watermark(ax)
    fig.savefig(out, dpi=180, bbox_inches="tight", facecolor=BLACK)
    plt.close(fig)
