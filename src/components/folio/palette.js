export const PALETTE = {
  // The physical body/depth/edge of every card — the extruded sides you
  // see along the hinge and outer edge. Fixed, never animated.
  body: "#989FAB",

  // The plain front face animates between these two as a card rotates:
  // white while it faces the camera, drifting to this purple as it turns
  // away. See the color-lerp comment in FolioCard.jsx.
  plainStart: "#6455D5",
  plainEnd: "#ffffff",
};
