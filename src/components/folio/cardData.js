/**
 * Every card is now identical in structure — the only thing that varies
 * per card is which image sits on its back. So instead of a hardcoded
 * list of cards, this builds N evenly-spaced specs for whatever N is —
 * pass 3 images or 30, the spacing recomputes automatically.
 */
export const CARD_WIDTH = 1.55;
export const CARD_HEIGHT = 2.40;
export const CARD_SPINE = 0.085;
export const CARD_DEPTH = 0.030;
export const CARD_RADIUS = 0.125;

export function buildCardSpecs(count, overrides = {}) {
  const n = Math.max(1, count);
  const width = overrides.width ?? CARD_WIDTH;
  const height = overrides.height ?? CARD_HEIGHT;
  const spine = overrides.spine ?? CARD_SPINE;

  return Array.from({ length: n }, (_, i) => ({
    id: `card-${i}`,
    angle: (Math.PI * 2 * i) / n,
    width,
    height,
    spine,
    // Small deterministic stagger so the fan doesn't look perfectly
    // combed — purely cosmetic, has no effect on spacing/rotation.
    y: ((i % 3) - 1) * 0.03,
    nudge: 0,
  }));
}
