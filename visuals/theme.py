"""
visuals/theme.py — brand constants and figure helpers

Brand:
  Primary   #6B21A8 / #A855F7  (purple deep / accent)
  Secondary #0A0A0A             (black)
  Tertiary  #F9F9F9             (white)
  Tagline   "Love is the Answer"
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch

# ── colours ──────────────────────────────────────────────────────────────────

PURPLE_DEEP   = "#6B21A8"
PURPLE_ACCENT = "#A855F7"
BLACK         = "#0A0A0A"
WHITE         = "#F9F9F9"
GRAY          = "#444444"

# ── figure setup ─────────────────────────────────────────────────────────────

def setup_figure(figsize=(10, 10), dpi=180):
    """Return (fig, ax) with brand background; spines and ticks hidden."""
    fig, ax = plt.subplots(figsize=figsize, dpi=dpi)
    fig.patch.set_facecolor(BLACK)
    ax.set_facecolor(BLACK)
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.tick_params(colors=WHITE, labelsize=13)
    return fig, ax


def setup_data_axes(ax, xlabel="", ylabel="", grid=True):
    """Style a data plot: bold white labels, optional grid, spine-free."""
    ax.xaxis.label.set_color(WHITE)
    ax.yaxis.label.set_color(WHITE)
    ax.tick_params(colors=WHITE, labelsize=13)
    if xlabel:
        ax.set_xlabel(xlabel, fontsize=14, fontweight="bold", color=WHITE, labelpad=10)
    if ylabel:
        ax.set_ylabel(ylabel, fontsize=14, fontweight="bold", color=WHITE, labelpad=10)
    if grid:
        ax.grid(color=GRAY, linewidth=0.6, alpha=0.5, linestyle="--")
    ax.set_facecolor(BLACK)
    for spine in ax.spines.values():
        spine.set_color(GRAY)
        spine.set_linewidth(0.8)


# ── watermark ────────────────────────────────────────────────────────────────

def add_watermark(ax):
    ax.text(
        0.99, 0.01, "Love is the Answer",
        transform=ax.transAxes,
        fontsize=7.5, color=WHITE, alpha=0.30,
        ha="right", va="bottom", style="italic",
    )


# ── node / box helpers ───────────────────────────────────────────────────────

def draw_node(ax, x, y, text, bg=PURPLE_DEEP, fg=WHITE,
              fontsize=13, radius=0.55):
    """Filled circle node (for base-quantity diagrams)."""
    circle = mpatches.Circle(
        (x, y), radius,
        facecolor=bg, edgecolor=PURPLE_ACCENT, linewidth=2.5,
        zorder=3,
    )
    ax.add_patch(circle)
    ax.text(x, y, text, ha="center", va="center",
            fontsize=fontsize, fontweight="bold", color=fg, zorder=4)


def draw_box(ax, x, y, text, color=PURPLE_ACCENT, fontsize=12,
             transform=None):
    """Rounded-rect label box (for derived quantities / annotations)."""
    kw = dict(transform=transform) if transform else {}
    ax.text(
        x, y, text,
        ha="center", va="center",
        fontsize=fontsize, fontweight="bold", color=WHITE,
        linespacing=1.6,
        bbox=dict(
            boxstyle="round,pad=0.7",
            facecolor=BLACK,
            edgecolor=color,
            linewidth=2.0,
        ),
        zorder=4,
        **kw,
    )


def draw_arrow(ax, x0, y0, x1, y1, color=PURPLE_ACCENT, lw=1.8):
    ax.annotate(
        "", xy=(x1, y1), xytext=(x0, y0),
        arrowprops=dict(
            arrowstyle="-|>",
            color=color,
            lw=lw,
            shrinkA=9, shrinkB=9,
        ),
        zorder=2,
    )
