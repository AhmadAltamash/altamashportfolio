import { useEffect, useRef, useState } from "react";

// A trailing dot rather than a full cursor replacement — swapping the
// pointer out entirely can hurt usability (people lose precise click
// feedback on small targets), while a dot that follows with a touch of
// lag reads as polish without giving anything up. Hidden automatically
// on touch devices via the `(hover: hover) and (pointer: fine)` CSS media
// query in index.css, which is also what disables the native cursor.
const CustomCursor = () => {
  const dotRef = useRef(null);
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Respect reduced-motion: skip the animated trailing effect and any
    // custom cursor rendering entirely, leaving the native cursor in place.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const handleMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };
    const handleLeave = () => setIsVisible(false);
    const handleOver = (e) => {
      setIsHovering(!!e.target.closest("a, button, [role='button']"));
    };

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseover", handleOver);

    let frameId;
    const animate = () => {
      // Lerp toward the real cursor position for the trailing/lag feel.
      position.current.x += (target.current.x - position.current.x) * 0.2;
      position.current.y += (target.current.y - position.current.y) * 0.2;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseover", handleOver);
      cancelAnimationFrame(frameId);
    };
  }, [isVisible]);

  return (
    <div
      ref={dotRef}
      className={`custom-cursor ${isHovering ? "custom-cursor-hover" : ""} ${!isVisible ? "custom-cursor-hidden" : ""}`}
      aria-hidden="true"
    />
  );
};

export default CustomCursor;
