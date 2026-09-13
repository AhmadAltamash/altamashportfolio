import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { buildCardSpecs } from "./cardData";
import { FolioCard } from "./FolioCard";
import { Lights } from "./Lights";
import { RotationRig } from "./RotationRig";
import { loadFolioTextures, createSheenTexture, createHoneycombTexture } from "./textures";

/** Uniform shrink applied to the whole card fan. Tune this one number
 *  rather than touching camera or per-card sizes. */
const SCENE_SCALE = 0.61;

/** How thick the visible glass-sheen streak looks (0-0.5, fraction of
 *  the card's height). This is the actual streak WIDTH — FolioCard.jsx's
 *  SHEEN_WIDTH is a different setting (how long, in degrees of rotation,
 *  the sheen stays visible), not how thick it looks. Raise this for a
 *  noticeably wider/thicker streak. */
const SHEEN_BAND_HALF_WIDTH = 0.15;

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const cam = camera;
    const aspect = size.width / Math.max(size.height, 1);
    const portrait = aspect < 0.85;
    cam.fov = portrait ? 44 : 34;
    cam.position.set(0, portrait ? 0.18 : 0.1, portrait ? 4.6 : 3.45);
    // Kept tight on purpose — a wide near/far range wastes depth-buffer
    // precision on space this scene never uses, and this scene has
    // several paper-thin, closely-stacked surfaces that need what
    // precision there is (see the zFace comment in FolioCard.jsx).
    cam.near = 0.5;
    cam.far = 14;
    cam.lookAt(0, 0.02, 0);
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function World({ images }) {
  const [textures, setTextures] = useState(null);
  const sheenTexture = useMemo(() => createSheenTexture(SHEEN_BAND_HALF_WIDTH), []);
  const honeycombTexture = useMemo(() => createHoneycombTexture(), []);

  // Keyed on the URLs themselves (a plain string), not the array
  // reference. If `images` is passed as an inline literal
  // (`<FolioOrbit images={["a.jpg", ...]} />`), React hands this
  // component a brand-new array every render — using `[images]` as the
  // dependency would tear this effect down and restart it on every
  // single render, sometimes disposing textures before they'd even
  // finished loading. This only re-runs when the actual URLs change.
  const imagesKey = images.join("|");

  useEffect(() => {
    let cancelled = false;
    loadFolioTextures(images).then((loaded) => {
      // No dispose-on-cancel here on purpose — textures.js caches by
      // URL now, so there's nothing to clean up: a cancelled load's
      // result is just a texture that's already safely cached for
      // whichever effect run actually needs it next.
      if (!cancelled) setTextures(loaded);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesKey]);

  useEffect(() => () => sheenTexture.dispose(), [sheenTexture]);
  useEffect(() => () => honeycombTexture.dispose(), [honeycombTexture]);

  const specs = useMemo(() => buildCardSpecs(images.length), [images.length]);

  return (
    <RotationRig>
      {specs.map((spec, i) => (
        <FolioCard
          key={spec.id}
          spec={spec}
          texture={textures ? textures[i] : null}
          hasLoaded={!!textures}
          sheenTexture={sheenTexture}
          honeycombTexture={honeycombTexture}
        />
      ))}
    </RotationRig>
  );
}

/**
 * `images` — array of URL strings, one per card. Swap in a fetched array
 * from your admin panel later; nothing else about this component needs
 * to change (see buildCardSpecs in cardData.js, which sizes the fan to
 * whatever length you pass).
 */
export default function FolioScene({ images }) {
  return (
    <Canvas
      className="folio-canvas"
      shadows
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.06,
        powerPreference: "high-performance",
        logarithmicDepthBuffer: true,
      }}
      camera={{ position: [0, 0.1, 3.45], fov: 34, near: 0.5, far: 14 }}
      onCreated={({ gl }) => {
        // Fully transparent — no backdrop, no solid fill. Whatever your
        // page's own background is shows straight through the canvas.
        // If you'd rather have a flat white canvas instead, swap this
        // for gl.setClearColor("#ffffff", 1).
        gl.setClearAlpha(0);
      }}
    >
      <AdaptiveDpr />
      <ResponsiveCamera />
      <Lights />
      <group scale={SCENE_SCALE}>
        <World images={images} />
      </group>
    </Canvas>
  );
}
