import { useEffect, useState } from "react";
import { Briefcase, Calendar, Sparkles } from "lucide-react";
import { db, collection } from "../firebase";
import { getDocs } from "firebase/firestore";

const ExperiencePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "experience"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setItems(list);
      } catch (err) {
        console.error("Error fetching experience:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Nothing to show and nothing loading — don't render an empty section
  // with a heading and no content underneath it.
  if (!loading && items.length === 0) return null;

  return (
    <div className="md:px-[10%] px-[5%] w-full mt-16 bg-[var(--bg-primary)]" id="Experience">
      <div className="text-center pb-14" data-aos="fade-up" data-aos-duration="1000">
        <h2 className="inline-block text-3xl md:text-5xl font-bold text-center mx-auto text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
          My Journey
        </h2>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-sm md:text-base mt-2 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Every role taught me something the last one couldn&apos;t
          <Sparkles className="w-4 h-4 text-purple-400" />
        </p>
      </div>

      {loading ? (
        <div className="w-8 h-8 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      ) : (
        <div className="relative max-w-4xl mx-auto pb-20">
          {/* The spine — a single glowing line running through the whole story */}
          <div
            className="absolute top-2 bottom-2 w-px left-6 md:left-1/2 md:-translate-x-1/2 bg-gradient-to-b from-indigo-500/60 via-purple-500/40 to-transparent"
            aria-hidden="true"
          />

          <div className="space-y-16">
            {items.map((item, index) => {
              const alignRight = index % 2 === 1;
              return (
                <div
                  key={item.id}
                  className="relative pl-16 md:pl-0 md:grid md:grid-cols-2 md:gap-x-12"
                >
                  {/* Node on the spine */}
                  <div className="absolute left-6 md:left-1/2 top-1.5 -translate-x-1/2 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-purple-500 blur-md opacity-60 animate-pulse" />
                      <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-[var(--bg-primary)] flex items-center justify-center">
                        <Briefcase className="w-2 h-2 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Empty spacer column so the card lands on the correct side on desktop */}
                  {!alignRight && <div className="hidden md:block" />}

                  <div
                    data-aos={alignRight ? "fade-left" : "fade-right"}
                    data-aos-duration="900"
                    className={`group relative ${alignRight ? "md:col-start-2" : ""}`}
                  >
                    {/* Little connector nub pointing back at the spine, desktop only */}
                    <div
                      className={`hidden md:block absolute top-3 w-6 h-px bg-gradient-to-r from-purple-500/40 to-transparent ${
                        alignRight ? "left-0 -translate-x-full rotate-180" : "right-0 translate-x-full"
                      }`}
                    />

                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full mb-3">
                      <Calendar className="w-3 h-3" />
                      {item.duration}
                    </span>

                    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 backdrop-blur-lg transition-all duration-300 group-hover:border-purple-500/30 group-hover:bg-[var(--card-bg-hover)] group-hover:-translate-y-1">
                      <h3 className="text-xl font-semibold text-[var(--text-primary)]">{item.role}</h3>
                      <p className="text-sm text-purple-300/80 mb-4">{item.company}</p>
                      <ul className="space-y-2">
                        {(item.bullets || []).map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-purple-400 mt-2 shrink-0" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Story closes with a quiet pulsing marker — the journey continues */}
            <div className="relative h-8" data-aos="fade-up">
              <div className="absolute left-6 md:left-1/2 top-1.5 -translate-x-1/2 z-10">
                <div className="w-4 h-4 rounded-full bg-[var(--bg-primary)] border-2 border-purple-500/60 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperiencePage;
