import { motion } from "framer-motion";

// Splits text into words so each can animate in with a slight stagger —
// reads as a much more deliberate "reveal" than a single block fading in
// all at once. Wrap each word in its own overflow-hidden span so the
// upward slide looks like it's emerging from behind the line, not just
// fading in place.
export const RevealText = ({ text, className = "", el: Tag = "div", delay = 0, wordDelay = 0.08 }) => {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
            delay: delay + i * wordDelay,
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};

// Simple fade-up reveal for paragraphs and other blocks where a
// word-by-word split isn't needed.
export const RevealBlock = ({ children, className = "", delay = 0, y = 16 }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
  >
    {children}
  </motion.div>
);
