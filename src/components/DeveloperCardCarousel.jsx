import { useEffect, useRef, useState } from "react";
import { db, collection } from "../firebase";
import { getDocs } from "firebase/firestore";

// A ring of double-sided cards — photo on the front, a solid theme-color
// face on the back — arranged in a circle in 3D space (rotateY + translateZ)
// inside a shared perspective container. Rotation is driven by cursor
// movement rather than a fixed CSS animation: a gentle constant idle spin
// keeps it alive at rest, and moving the mouse left/right adds momentum in
// that direction, decaying back toward the idle speed like a flywheel.
const IDLE_SPEED = 0.06; // deg per frame when the cursor isn't moving
const MOUSE_SENSITIVITY = 0.045; // how much cursor movement adds to spin speed
const MAX_SPEED = 2.2; // deg per frame, clamps how fast a hard swipe can spin it
const DECAY = 0.94; // how quickly added speed settles back toward idle each frame

const DeveloperCardCarousel = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const ringRef = useRef(null);
  const rotation = useRef(0);
  const speed = useRef(IDLE_SPEED);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, "profileCards"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const orderA = a.Order ?? Infinity;
          const orderB = b.Order ?? Infinity;
          return orderA - orderB;
        });
        if (!cancelled) setCards(data);
      } catch (err) {
        console.error("Failed to load profile cards:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handleMove = (e) => {
      // Positive movementX (moving right) speeds up rotation in one
      // direction; negative (moving left) pushes it the other way — this is
      // the "spins in whichever direction you move the cursor" feel.
      speed.current += e.movementX * MOUSE_SENSITIVITY;
      speed.current = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, speed.current));
    };
    window.addEventListener("mousemove", handleMove);

    if (reduceMotion) {
      // Respect reduced-motion: no idle spin, no momentum — just react
      // minimally to direct input, no self-sustaining animation loop.
      return () => window.removeEventListener("mousemove", handleMove);
    }

    let frameId;
    const animate = () => {
      // Decay back toward the idle speed rather than to zero, so it's
      // always gently alive even with no interaction at all.
      speed.current = IDLE_SPEED + (speed.current - IDLE_SPEED) * DECAY;
      rotation.current += speed.current;
      if (ringRef.current) {
        ringRef.current.style.transform = `rotateY(${rotation.current}deg)`;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Falls back to a few empty color-only cards if none have been uploaded
  // yet, so the carousel still looks intentional (not broken/empty) before
  // any photos are added from the admin panel.
  const items = cards.length > 0 ? cards : Array.from({ length: 4 }, (_, i) => ({ id: `placeholder-${i}` }));

  const angleStep = 360 / items.length;

  if (loading) return null;

  return (
    <div className="dcc-scene" role="img" aria-label="Rotating showcase of developer photos">
      <div ref={ringRef} className="dcc-ring">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="dcc-card"
            style={{
              transform: `rotateY(${i * angleStep}deg) translateZ(var(--dcc-radius))`,
            }}
          >
            <div className="dcc-face dcc-face-front">
              {item.Img ? (
                <img src={item.Img} alt="" loading="lazy" />
              ) : (
                <div className="dcc-face-empty" />
              )}
            </div>
            <div className="dcc-face dcc-face-back" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeveloperCardCarousel;
