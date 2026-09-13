import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "./palette";
import { CARD_DEPTH, CARD_RADIUS } from "./cardData";
import { roundedCardGeometry, roundedPlaneGeometry } from "./geometry";

// A short "hop" right as a page swings through edge-on to the camera —
// the moment it's turning from front-facing to back-facing (or back
// again) — not a continuous bob the rest of the time.
const BOUNCE_HEIGHT = 0.05;
const BOUNCE_WIDTH = 0.15; // radians — how wide the bump is around the turn point

// The glass sheen sweeping down the image face. Unlike the bounce, this
// is centered on the image (back face) actually facing the camera
// (phase 0 below), not on the edge-on crossing — and it's driven by the
// fan's current rotation speed/direction rather than running at a fixed
// rate. See the useFrame body for how SHEEN_LEAD is applied.
const SHEEN_PEAK_OPACITY = 0.38;
const SHEEN_WIDTH = 0.35; // radians — how wide a slice of rotation it's visible for
// How far ahead of "fully facing the camera" it starts, in radians,
// measured against whichever direction the fan is currently turning —
// so it leads the turn regardless of spin direction. 0 = starts exactly
// as the image squarely faces the camera; bigger = starts earlier.
const SHEEN_LEAD = 0.1;
// Converts the fan's rotation speed (rad/s) into how fast the sheen
// texture scrolls. Raise this if the sweep feels too slow relative to
// how fast the fan is spinning, lower it if it feels too fast.
const SHEEN_SPEED_SCALE = 0.119;
// Tilts the sheen streak off the vertical so it doesn't read as a dead
// straight horizontal line across the picture. Degrees, not radians.
const SHEEN_TILT_DEGREES = 15;
const SHEEN_TILT = THREE.MathUtils.degToRad(SHEEN_TILT_DEGREES);

const colorA = new THREE.Color(PALETTE.plainStart);
const colorB = new THREE.Color(PALETTE.plainEnd);
const tmpColor = new THREE.Color();

function angularDelta(a, b) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

/**
 * One card. `spec` places it on the shared spine (see cardData.js);
 * `texture` is this card's one and only image, applied to the back face.
 * The front face never carries an image — it's a flat color that
 * animates white -> PALETTE.plainEnd as the card turns, so there is
 * never more than one image texture in play per card (no jitter, no
 * z-fighting between two competing image layers).
 */
export function FolioCard({ spec, texture, hasLoaded, sheenTexture, honeycombTexture }) {
  const { width, height, angle, y, spine, nudge } = spec;
  const hinge = useRef(null);
  const frontMatRef = useRef(null);
  const backMatRef = useRef(null);
  const sheenRef = useRef(null);

  const body = useMemo(
    () => roundedCardGeometry(width, height, CARD_DEPTH, CARD_RADIUS),
    [width, height],
  );

  const face = useMemo(
    () => roundedPlaneGeometry(width, height, CARD_RADIUS),
    [width, height],
  );

  // The image face's `map` is kept in sync imperatively here — NOT via
  // the plain `<meshBasicMaterial map={texture} />` JSX form. The
  // reason: whether a material has a map at all is baked into its
  // *compiled shader* the first time it renders. This material's first
  // render has `texture === null` (still loading), so it compiles
  // without any texture-sampling code path whatsoever. When the real
  // texture arrives later, just reassigning `.map` has nothing to show
  // for it — the already-compiled shader has no code that reads a map,
  // full stop. Setting `material.needsUpdate = true` forces a shader
  // recompile so the newly-present map actually gets used. This was the
  // actual bug behind "the image never renders" — not lighting, not
  // loading, the shader itself never had the capability to draw it.
  useLayoutEffect(() => {
    const mat = backMatRef.current;
    if (!mat) return;
    mat.map = texture ?? null;
    mat.color.set(texture ? "#ffffff" : hasLoaded ? "#ff3d68" : "#d8d8d8");
    mat.needsUpdate = true;
  }, [texture, hasLoaded]);

  // The diagonal tilt lives entirely in the TEXTURE's UV space now, not
  // in the mesh's 3D rotation. Rotating an *enlarged* mesh in 3D (the
  // previous approach) sweeps its corners outside the card's own
  // boundary once rotated — that overhang is exactly what showed up as
  // a glow floating past the card's edge, especially at near-edge-on
  // viewing angles where even a small overhang catches a grazing view.
  // Texture.rotation instead rotates what's *sampled* onto a mesh whose
  // shape never changes — so the sheen mesh below is an exact, unrotated
  // copy of the card's own face, and there is structurally no way for it
  // to extend past the card's edge at any angle. sheenTexture is a
  // single object shared across every card instance, so this only needs
  // to be set once; each card setting the same value again is harmless.
  useLayoutEffect(() => {
    if (!sheenTexture) return;
    sheenTexture.center.set(0.5, 0.5);
    sheenTexture.rotation = SHEEN_TILT;
  }, [sheenTexture]);

  // Gap between the card body and its front/back face planes — kept
  // deliberately generous (not the ~0.001 you'd naively reach for) so it
  // survives being shrunk further by FolioScene's <group scale>. Too
  // small a gap here, combined with a wide camera near/far range, is
  // what causes z-fighting/flicker on thin stacked surfaces; see
  // FolioScene.jsx for the matching near/far + logarithmicDepthBuffer.
  const zFace = CARD_DEPTH / 2 + 0.01;

  useFrame((_, delta) => {
    // RotationRig writes these every frame: __folioY is "where is the
    // fan right now", __folioSpin is "how fast, and which direction"
    // (positive/negative rad/s). Cheaper than plumbing both down through
    // context for what's just a read-only query.
    const rigY = window.__folioY || 0;
    const spin = window.__folioSpin || 0;
    const relToCamera = angularDelta(angle + rigY, 0);

    // Envelope for the bounce: peaks exactly when this card is edge-on
    // to the camera (±90° from facing it), i.e. the instant it's
    // transitioning between front-visible and back-visible.
    const distTo90 = Math.abs(angularDelta(relToCamera, Math.PI / 2));
    const distToNeg90 = Math.abs(angularDelta(relToCamera, -Math.PI / 2));
    const turnDistance = Math.min(distTo90, distToNeg90);
    const envelope = Math.exp(-(turnDistance * turnDistance) / (2 * BOUNCE_WIDTH * BOUNCE_WIDTH));

    if (hinge.current) {
      hinge.current.position.y = y + envelope * BOUNCE_HEIGHT;
    }

    // Plain-face color: white while facing the camera, PALETTE.plainEnd
    // once fully turned away. (1 - cos(x)) / 2 gives a smooth ease
    // in/out instead of a linear ramp or a hard cutoff at some angle.
    const t = (1 - Math.cos(relToCamera)) / 2;
    if (frontMatRef.current) {
      tmpColor.copy(colorA).lerp(colorB, t);
      frontMatRef.current.color.copy(tmpColor);
    }

    // `phase` is 0 exactly when the IMAGE (back face) is squarely facing
    // the camera — the opposite point from relToCamera's 0.
    const phase = angularDelta(angle + rigY, Math.PI);

    // The sheen's trigger point sits SHEEN_LEAD radians before phase=0,
    // on whichever side the card is currently approaching it from. That
    // side depends on which way the fan is spinning right now, hence
    // dirSign: if spin is positive, phase is climbing up toward 0 from
    // below, so "a little before" means a target slightly less than 0;
    // if spin is negative, phase is dropping toward 0 from above, so the
    // target is slightly more than 0. Reversing the spin flips which
    // side "before" is on automatically.
    const dirSign = spin >= 0 ? 1 : -1;
    const sheenTarget = -dirSign * SHEEN_LEAD;
    const sheenDistance = Math.abs(angularDelta(phase, sheenTarget));
    const sheenEnvelope = Math.exp(-(sheenDistance * sheenDistance) / (2 * SHEEN_WIDTH * SHEEN_WIDTH));

    // Sheen only exists on the image (back) face, and only lights up
    // during that lead-in to the image facing the camera — not a
    // permanent overlay. Its scroll direction and speed both come
    // directly from the fan's current spin: reverse the fan, the sweep
    // reverses; speed it up, the sweep speeds up; stop it, the sweep
    // stops.
    if (sheenRef.current) {
      sheenRef.current.material.opacity = sheenEnvelope * SHEEN_PEAK_OPACITY;
      const scroll = spin * SHEEN_SPEED_SCALE * delta;
      sheenTexture.offset.y = ((sheenTexture.offset.y + scroll) % 1 + 1) % 1;
    }
  });

  return (
    <group rotation={[0, angle, 0]}>
      <group position={[width / 2 + spine, y, nudge]} ref={hinge}>
        {/* Body — the extruded sides/edges. Fixed color, never animated. */}
        <mesh geometry={body} castShadow receiveShadow>
          <meshStandardMaterial color={PALETTE.body} roughness={0.5} metalness={0.05} />
        </mesh>

        {/* Front — plain surface, no image, ever. Color is set every
            frame above via frontMatRef, the `color` prop below is just
            the initial value before the first frame runs. The bump map
            is the faint honeycomb/scale texture — barely visible, never
            affects the actual white/purple color underneath it. */}
        <mesh geometry={face} position={[0, 0, zFace]} castShadow>
          <meshStandardMaterial
            ref={frontMatRef}
            color={PALETTE.plainStart}
            roughness={0.55}
            metalness={0.03}
            bumpMap={honeycombTexture}
            bumpScale={0.5}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>

        {/* Back — the one and only image surface on this card. map/color
            are kept in sync imperatively via backMatRef (see the effect
            above) rather than through the `map`/`color` props directly —
            that's what actually fixes the image not appearing. Still
            unlit (meshBasicMaterial): full, consistent brightness
            regardless of scene lighting. */}
        <mesh geometry={face} position={[0, 0, -zFace]} rotation={[0, Math.PI, 0]}>
          <meshBasicMaterial
            ref={backMatRef}
            toneMapped={false}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>

        {/* A failed image load still shows something's wrong — the back
            face tints to a solid red-ish color instead of showing a
            texture (see the mat.color.set(...) logic above) — without
            needing drei's <Text> component, which pulls in the whole
            troika-three-text engine (a real chunk of the bundle) just
            to print a debug URL on the card. If you need to see exactly
            which URL failed while debugging, temporarily add it back:
            <Text> from "@react-three/drei", positioned at
            [0, 0, -zFace - 0.02], rotation [0, Math.PI, 0]. */}

        {/* Glass sheen — lives directly outside the image face only
            (never the front), fading in right as the image turns
            edge-on. Uses the card's own exact face geometry (same `face`
            as the back face above) with only the necessary Y-flip to
            match its orientation — no separate enlarged/rotated geometry.
            The diagonal tilt comes from sheenTexture.rotation (set once,
            see the useLayoutEffect above), not from rotating this mesh —
            see that effect's comment for why. Delete this one <mesh>
            block if you'd rather not have it; nothing else depends on
            it. */}
        <mesh ref={sheenRef} geometry={face} position={[0, 0, -zFace - 0.004]} rotation={[0, Math.PI, 0]}>
          <meshBasicMaterial
            map={sheenTexture}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}
