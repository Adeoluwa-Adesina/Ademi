"""
fig-16: metric-prefix number line.

Horizontal log-scale line from 10⁻¹⁵ (femto) to 10¹² (tera), with
prefix labels above and real-world examples below.
"""

from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from visuals.theme import (
    BLACK, WHITE, PURPLE_DEEP, PURPLE_ACCENT, GRAY,
    setup_figure, add_watermark,
)

PREFIXES = [
    (-15, "femto", "f",  r"$10^{-15}$"),
    (-12, "pico",  "p",  r"$10^{-12}$"),
    (-9,  "nano",  "n",  r"$10^{-9}$"),
    (-6,  "micro", "μ",  r"$10^{-6}$"),
    (-3,  "milli", "m",  r"$10^{-3}$"),
    ( 0,  "",      "1",  r"$10^{0}$"),
    ( 3,  "kilo",  "k",  r"$10^{3}$"),
    ( 6,  "mega",  "M",  r"$10^{6}$"),
    ( 9,  "giga",  "G",  r"$10^{9}$"),
    (12,  "tera",  "T",  r"$10^{12}$"),
]

EXAMPLES = [
    (-15, "proton\nradius"),
    (-9,  "DNA\nwidth"),
    (-3,  "rain\ndrop"),
    ( 0,  "meter\nstick"),
    ( 3,  "1 km\nroad"),
    ( 6,  "Earth\nradius ×0.16"),
    ( 9,  "Earth–Moon\ndistance"),
    (12,  "Earth–Sun\ndistance ×0.007"),
]


def draw(out: Path) -> None:
    fig, ax = setup_figure(figsize=(10, 10))
    ax.set_xlim(-16.5, 13.5)
    ax.set_ylim(-4.5, 5.5)
    ax.axis("off")

    # main axis line
    ax.annotate("", xy=(13, 0), xytext=(-16, 0),
                arrowprops=dict(arrowstyle="-|>", color=WHITE, lw=2.0))

    # tick marks + prefix labels
    for exp, name, symbol, latex_exp in PREFIXES:
        ax.plot([exp, exp], [-0.18, 0.18], color=WHITE, lw=1.8)
        # LaTeX power-of-ten label just below tick
        ax.text(exp, -0.45, latex_exp,
                ha="center", va="top", fontsize=10, color=GRAY)
        # prefix name + symbol above tick
        color = PURPLE_ACCENT if exp != 0 else WHITE
        label = f"{name}\n{symbol}" if name else symbol
        ax.text(exp, 0.55, label, ha="center", va="bottom",
                fontsize=11 if name else 10,
                fontweight="bold", color=color, linespacing=1.4)

    # LOW / HIGH endpoint cues (above the line to avoid overlap)
    ax.text(-16.2, 0.35, "SMALL", ha="left", va="center",
            fontsize=11, fontweight="bold", color=PURPLE_ACCENT, alpha=0.8)
    ax.text(13.2, 0.35, "LARGE", ha="left", va="center",
            fontsize=11, fontweight="bold", color=PURPLE_ACCENT, alpha=0.8)

    # real-world examples below
    for exp, label in EXAMPLES:
        ax.plot([exp, exp], [-0.18, -0.9], color=GRAY, lw=1.0, alpha=0.6)
        ax.text(exp, -1.1, label, ha="center", va="top",
                fontsize=9, color=GRAY, linespacing=1.4)

    ax.set_title("Metric prefixes: powers of ten",
                 fontsize=20, fontweight="bold", color=WHITE, pad=0,
                 y=0.97)

    add_watermark(ax)
    fig.savefig(out, dpi=180, bbox_inches="tight", facecolor=BLACK)
    plt.close(fig)
