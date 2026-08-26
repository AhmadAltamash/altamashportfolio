import { useState } from "react";
import { Briefcase, X, MessageCircle, Mail } from "lucide-react";

const WHATSAPP_NUMBER = "917488438343"; // +91 7488438343
const CONTACT_EMAIL = "work.altamashahmad@gmail.com";

const JoinAvailabilityButton = () => {
  const [open, setOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Altamash, I came across your portfolio and would like to talk about an opportunity."
  )}`;
  const emailUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Opportunity for you"
  )}&body=${encodeURIComponent("Hi Altamash,\n\n")}`;

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      {open && (
        <div className="absolute bottom-16 right-0 w-[calc(100vw-3rem)] max-w-[320px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl shadow-black/50 p-5 mb-2 animate-[fadeIn_0.2s_ease-out]">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2 pr-6">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <h3 className="text-[var(--text-primary)] font-semibold text-base leading-tight">
              Immediately Available to Join
            </h3>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            Ready to start immediately! Experienced full-stack developer seeking exciting
            opportunities to contribute to innovative teams and projects.
          </p>

          <div className="flex flex-col gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:brightness-110 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" /> Message on WhatsApp
            </a>
            <a
              href={emailUrl}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white text-sm font-medium hover:scale-[1.02] active:scale-95 transition-transform"
            >
              <Mail className="w-4 h-4" /> Send Email
            </a>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">Response within 24 hours</p>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close availability card" : "I'm open to join"}
        className="relative w-14 h-14 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] shadow-lg shadow-purple-500/30 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
      >
        {!open && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-40 animate-ping" />
        )}
        {open ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <Briefcase className="w-6 h-6 relative z-10" />
        )}
      </button>
    </div>
  );
};

export default JoinAvailabilityButton;
