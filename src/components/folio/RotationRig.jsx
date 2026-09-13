import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * The composition has its own internal clock.
 *
 *   baseRotation += AUTO_SPEED * dt          // always running
 *   mouseInfluence decays toward 0 when idle
 *   group.rotation.y = base + influence
 *
 * Mouse movement NEVER replaces auto-rotation. When the pointer stops,
 * influence fades and the timelapse continues.
 *
 * INFLUENCE_GAIN / MAX_INFLUENCE_SPEED were bumped up from the previous
 * pass (1.35 -> 2.1, 1.15 -> 1.9) so cursor movement visibly speeds the
 * spin up more than before — everything else (auto speed, decay times)
 * is unchanged.
 */
const AUTO_SPEED = 0.60; // rad/s — slow timelapse (~28s per turn)
const MAX_INFLUENCE_SPEED = 15;
const INFLUENCE_GAIN = 12;
const INFLUENCE_DECAY = 2.4;
const OFFSET_GAIN = 0.55;
const OFFSET_DECAY = 3.2;
const TILT_GAIN = 0.1;
const TILT_DECAY = 2.8;

const pointer = {
  lastX: 0,
  lastY: 0,
  lastT: 0,
  vx: 0,
  moving: false,
  nx: 0,
  ny: 0,
};

export function RotationRig({ children }) {
  const group = useRef(null);
  const base = useRef(3.05);
  const infl = useRef(0);
  const offset = useRef(0);
  const tilt = useRef(0);

  useEffect(() => {
    let stopTimer = 0;

    const markMove = (clientX, clientY) => {
      const now = performance.now();
      const dt = Math.max((now - pointer.lastT) / 1000, 1 / 240);
      if (pointer.lastT > 0) {
        const dx = clientX - pointer.lastX;
        pointer.vx = dx / window.innerWidth / dt;
      }
      pointer.lastX = clientX;
      pointer.lastY = clientY;
      pointer.lastT = now;
      pointer.moving = true;
      pointer.nx = clientX / window.innerWidth - 0.5;
      pointer.ny = clientY / window.innerHeight - 0.5;
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => {
        pointer.moving = false;
        pointer.vx = 0;
      }, 90);
    };

    const onPointerMove = (e) => markMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (t) markMove(t.clientX, t.clientY);
    };
    const onLeave = () => {
      pointer.moving = false;
      pointer.vx = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("blur", onLeave);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("mouseleave", onLeave);
      window.clearTimeout(stopTimer);
    };
  }, []);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    const g = group.current;
    if (!g) return;

    const targetInfl = clamp(pointer.vx * INFLUENCE_GAIN, -MAX_INFLUENCE_SPEED, MAX_INFLUENCE_SPEED);
    const inflFollow = 1 - Math.exp(-d * 7);
    infl.current += (targetInfl - infl.current) * inflFollow;
    if (!pointer.moving) {
      infl.current *= Math.exp(-d * INFLUENCE_DECAY);
    }

    const targetOff = pointer.moving ? pointer.nx * OFFSET_GAIN : 0;
    offset.current += (targetOff - offset.current) * (1 - Math.exp(-d * OFFSET_DECAY));

    const targetTilt = pointer.moving ? pointer.ny * TILT_GAIN : 0;
    tilt.current += (targetTilt - tilt.current) * (1 - Math.exp(-d * TILT_DECAY));

    base.current += (AUTO_SPEED + infl.current) * d;

    g.rotation.y = base.current + offset.current;
    g.rotation.x = tilt.current;
    // Read by each FolioCard: __folioY for "where is the fan right now"
    // (bounce/color), __folioSpin for "how fast, and which direction"
    // (the glass sheen's speed and sweep direction follow this).
    window.__folioY = g.rotation.y;
    window.__folioSpin = AUTO_SPEED + infl.current;
  });

  return <group ref={group}>{children}</group>;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
