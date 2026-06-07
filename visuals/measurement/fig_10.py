"""
fig-10: length-of-day variation graph.

Shows tiny wiggles (~ms) in Earth's rotation — the real-data inspiration
from HRW. Generated with a synthetic but physically plausible model:
  - annual oscillation (atmospheric angular momentum)
  - semi-annual oscillation
  - decadal trend (tidal braking)
  - small noise
"""

from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from visuals.theme import (
    BLACK, WHITE, PURPLE_DEEP, PURPLE_ACCENT, GRAY,
    setup_figure, setup_data_axes, add_watermark,
)


def _synthetic_lod(years: np.ndarray) -> np.ndarray:
    """Deviation from 86 400 s in milliseconds."""
    t = years - years[0]
    annual     =  1.2 * np.sin(2 * np.pi * t)
    semi_annual=  0.5 * np.sin(4 * np.pi * t)
    decadal    =  1.8 * np.sin(2 * np.pi * t / 18)   # ~18-yr tidal cycle
    noise      =  0.15 * np.random.default_rng(42).standard_normal(len(t))
    return annual + semi_annual + decadal + noise


def draw(out: Path) -> None:
    # ~4 points per year gives smooth annual cycles without over-crowding
    years = np.linspace(1962, 2024, 250)
    lod   = _synthetic_lod(years)

    fig, ax = setup_figure()
    setup_data_axes(ax,
                    xlabel="YEAR",
                    ylabel="LENGTH-OF-DAY DEVIATION (ms)")

    ax.plot(years, lod, color=PURPLE_ACCENT, linewidth=2.5, zorder=3)
    ax.axhline(0, color=GRAY, linewidth=0.8, linestyle="--", alpha=0.6)

    # annotation
    ax.annotate(
        "Tidal drag from\nthe Moon",
        xy=(1990, lod[np.argmin(np.abs(years - 1990))]),
        xytext=(1974, -3.2),
        fontsize=12, fontweight="bold", color=WHITE,
        linespacing=1.6,
        bbox=dict(boxstyle="round,pad=0.7", facecolor=BLACK,
                  edgecolor=PURPLE_ACCENT, linewidth=2.0),
        arrowprops=dict(arrowstyle="-|>", color=PURPLE_ACCENT,
                        lw=1.8, shrinkA=9, shrinkB=9),
    )

    ax.set_xlim(years[0], years[-1])
    ax.set_title("The length of a day is not constant",
                 fontsize=20, fontweight="bold", color=WHITE, pad=16)
    ax.xaxis.set_major_locator(ticker.MultipleLocator(10))

    add_watermark(ax)
    fig.tight_layout()
    fig.savefig(out, dpi=180, bbox_inches="tight", facecolor=BLACK)
    plt.close(fig)
