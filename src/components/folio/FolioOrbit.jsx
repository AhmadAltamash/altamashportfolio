import FolioScene from "./FolioScene";

export const DEFAULT_IMAGES = [
  "/folio/workbench.jpg",
  "/folio/breadboard.jpg",
  "/folio/sphere.jpg",
  "/folio/workbench.jpg",
  "/folio/breadboard.jpg",
];

/**
 * <FolioOrbit images={["/img1.jpg", "/img2.jpg", ...]} />
 *
 * Self-contained — drop it anywhere. It fills its parent, so give that
 * parent an explicit size:
 *
 *   <div style={{ width: "100%", height: 600 }}>
 *     <FolioOrbit images={images} />
 *   </div>
 *
 * `images` is a plain array of URL strings, one per card — any length
 * works, the fan spaces itself evenly. Swap in an array fetched from
 * your admin panel later; nothing else here needs to change.
 */
export default function FolioOrbit({ images = DEFAULT_IMAGES, className, style }) {
  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      <FolioScene images={images} />
    </div>
  );
}
