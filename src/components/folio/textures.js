import * as THREE from "three";

// three.js's own loader instead of a hand-rolled Image()-based one —
// it's the standard, battle-tested path for getting a texture from a
// URL and handles the image-decode → GPU-upload handoff itself.
const loader = new THREE.TextureLoader();

// Cached by URL for the life of the page. This is the actual fix for
// "loaded once, then never again after a refresh": React's StrictMode
// (dev only) mounts every component twice — mount, cleanup, mount again
// — and the previous version disposed a texture in that cleanup if it
// hadn't been "claimed" by the time it finished loading. The very first
// time, the image fetch was slow enough (cold network) that this never
// mattered. After that, the browser's own HTTP cache made every
// subsequent load resolve almost instantly — fast enough to consistently
// land inside that mount→cleanup→mount window and get disposed before it
// ever reached the screen. Caching the texture object itself here means
// a second load of the same URL just returns the already-good texture
// instead of racing to create (and potentially dispose) a new one.
const textureCache = new Map();

function loadTexture(src) {
  if (textureCache.has(src)) {
    return Promise.resolve(textureCache.get(src));
  }
  return new Promise((resolve) => {
    loader.load(
      src,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        // Mipmapping disabled on purpose: it requires power-of-two
        // dimensions to behave consistently everywhere, which arbitrary
        // admin-uploaded images (Cloudinary/Firebase, per your setup)
        // won't reliably have. LinearFilter alone still looks perfectly
        // good at the sizes these cards render at.
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.anisotropy = 8;
        tex.needsUpdate = true;
        textureCache.set(src, tex);
        resolve(tex);
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.error(`FolioOrbit: failed to load image "${src}" — check the URL/path/CORS.`, err);
        resolve(null);
      },
    );
  });
}

/**
 * One texture per image, same order as the input array. A failed/missing
 * image resolves to `null` in its slot (see the bright fallback color in
 * FolioCard.jsx) rather than rejecting the whole batch — one bad URL
 * from an admin panel shouldn't blank out every card.
 */
export async function loadFolioTextures(images) {
  return Promise.all(images.map(loadTexture));
}

// Exported for completeness if you ever want to explicitly free a
// texture (e.g. you know an admin-panel image was deleted for good).
// FolioScene does NOT call this on ordinary effect cleanup any more —
// see the cache above for why that was actively harmful.
export function disposeFolioTexture(src) {
  const tex = textureCache.get(src);
  if (tex) {
    tex.dispose();
    textureCache.delete(src);
  }
}

// Half-width of the bright band as a fraction of the texture's height —
// this is the thing that actually controls how THICK the visible glass
// streak looks. (FolioCard.jsx's SHEEN_WIDTH is a different thing
// entirely: it controls how long, in degrees of rotation, the sheen
// stays visible before fading — not how wide the streak itself is.)
// 0.04 = current default (a band from 46% to 54% of the height). Bump
// this up for a noticeably thicker streak, e.g. 0.12 for a wide glow.
const SHEEN_BAND_HALF_WIDTH = 0.04;

function drawSheen(ctx, w, h, bandHalfWidth = SHEEN_BAND_HALF_WIDTH) {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  const edge = Math.max(0.001, bandHalfWidth * 0.15); // soft falloff at the band's own edges
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(Math.max(0, 0.5 - bandHalfWidth - edge), "rgba(255,255,255,0)");
  g.addColorStop(0.5 - bandHalfWidth, "rgba(255,255,255,0)");
  g.addColorStop(0.5, "rgba(255,255,255,0.9)");
  g.addColorStop(0.5 + bandHalfWidth, "rgba(255,255,255,0)");
  g.addColorStop(Math.min(1, 0.5 + bandHalfWidth + edge), "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** A single soft horizontal band, tiled vertically and scrolled over
 *  time to read as a light sweep moving down the image. Pass a
 *  bandHalfWidth (0-0.5) to control how thick the visible streak looks —
 *  see SHEEN_BAND_HALF_WIDTH above. */
export function createSheenTexture(bandHalfWidth = SHEEN_BAND_HALF_WIDTH) {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 512;
  const ctx = c.getContext("2d");
  drawSheen(ctx, 64, 512, bandHalfWidth);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function drawHoneycomb(ctx, w, h) {
  // Mid-gray = zero displacement as a bump map; lighter/darker strokes
  // read as very shallow ridges once lit, giving the plain face the
  // faint scale/honeycomb-like texture from the reference screenshot.
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 6;
  const amp = 7;
  const period = 24;
  for (let y = -10; y < h + 10; y += 9) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const yy = y + Math.sin((x / period) * Math.PI * 2 + y * 0.05) * amp;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
}

/** Very subtle repeating surface pattern for the plain face — used as a
 *  bump map only (never a color map), so it stays faint regardless of
 *  the white/purple color animating underneath it. */
export function createHoneycombTexture() {
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 160;
  const ctx = c.getContext("2d");
  drawHoneycomb(ctx, 160, 160);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 6); // tiled several times across a card's face
  tex.needsUpdate = true;
  return tex;
}
