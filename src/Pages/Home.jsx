import { useState, useEffect, useCallback, memo } from "react"
import { Github, Linkedin, Mail, ExternalLink, Instagram, Sparkles } from "lucide-react"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const CODE_LINES = [
  { indent: 0, tokens: [{ t: "const", c: "text-purple-400" }, { t: " developer ", c: "text-gray-200" }, { t: "=", c: "text-purple-400" }, { t: " {", c: "text-gray-400" }] },
  { indent: 1, tokens: [{ t: "name", c: "text-blue-300" }, { t: ": ", c: "text-gray-400" }, { t: "'Altamash Ahmad'", c: "text-green-400" }, { t: ",", c: "text-gray-400" }] },
  { indent: 1, tokens: [{ t: "role", c: "text-blue-300" }, { t: ": ", c: "text-gray-400" }, { t: "'Full Stack Developer'", c: "text-green-400" }, { t: ",", c: "text-gray-400" }] },
  { indent: 1, tokens: [{ t: "stack", c: "text-blue-300" }, { t: ": ", c: "text-gray-400" }, { t: "['React', 'Node.js', 'Python']", c: "text-orange-300" }, { t: ",", c: "text-gray-400" }] },
  { indent: 1, tokens: [{ t: "available", c: "text-blue-300" }, { t: ": ", c: "text-gray-400" }, { t: "true", c: "text-pink-400" }] },
  { indent: 0, tokens: [{ t: "};", c: "text-gray-400" }] },
];

const CodeEditorVisual = memo(({ isHovering }) => {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= CODE_LINES.length) return;
    const timer = setTimeout(() => setVisibleLines((v) => v + 1), 350);
    return () => clearTimeout(timer);
  }, [visibleLines]);

  return (
    <div
      className={`w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/90 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 ${
        isHovering ? "scale-105 -rotate-1 shadow-purple-500/20" : "scale-100"
      }`}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs text-gray-500 font-mono">portfolio.js</span>
      </div>

      {/* Code body */}
      <div className="p-5 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed min-h-[220px] sm:min-h-[260px]">
        {CODE_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ paddingLeft: `${line.indent * 1.25}rem` }} className="whitespace-pre">
            <span className="text-gray-600 select-none mr-3">{String(i + 1).padStart(2, "0")}</span>
            {line.tokens.map((tok, j) => (
              <span key={j} className={tok.c}>{tok.t}</span>
            ))}
          </div>
        ))}
        {visibleLines < CODE_LINES.length && (
          <div style={{ paddingLeft: `${(CODE_LINES[visibleLines]?.indent || 0) * 1.25}rem` }}>
            <span className="text-gray-600 select-none mr-3">{String(visibleLines + 1).padStart(2, "0")}</span>
            <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse align-middle" />
          </div>
        )}
      </div>
    </div>
  );
});

// Memoized Components
const StatusBadge = memo(() => (
  <div className="inline-block animate-float lg:mx-0 sm:my-0 my-2" data-aos="zoom-in" data-aos-delay="400">
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
      <div className="relative px-3 sm:px-4 py-2 rounded-full bg-bg-secondary/60 backdrop-blur-xl border border-[var(--border-color)]">
        <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-transparent bg-clip-text sm:text-sm text-[0.7rem] font-medium flex items-center">
          <Sparkles className="sm:w-4 sm:h-4 w-3 h-3 mr-2 text-blue-400" />
          Ready to Innovate
        </span>
      </div>
    </div>
  </div>
));

const MainTitle = memo(() => (
  <div className="space-y-2" data-aos="fade-up" data-aos-delay="600">
    <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
      <span className="relative inline-block">
        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
        <span className="relative hero-gradient-text">
          Full Stack
        </span>
      </span>
      <br />
      <span className="relative inline-block mt-2">
        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
        <span className="relative bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
          Developer
        </span>
      </span>
    </h1>
  </div>
));

const TechStack = memo(({ tech }) => (
  <div className="px-4 py-2 hidden sm:block rounded-full bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)] transition-colors">
    {tech}
  </div>
));

const CTAButton = memo(({ href, text, icon: Icon }) => (
  <a href={href}>
    <button className="group relative w-[160px]">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur-md group-hover:opacity-90 transition-all duration-700"></div>
      <div className="relative h-11 bg-[var(--bg-secondary)] backdrop-blur-xl rounded-lg border border-[var(--border-color)] leading-none overflow-hidden">
        <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 bg-gradient-to-r from-[#4f52c9]/20 to-[#8644c5]/20"></div>
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm group-hover:gap-3 transition-all duration-300">
          <span className="subtle-gradient-text font-medium z-10">
            {text}
          </span>
          <Icon className={`w-4 h-4 text-text-secondary ${text === 'Contact' ? 'group-hover:translate-x-1' : 'group-hover:rotate-45'} transform transition-all duration-300 z-10`} />
        </span>
      </div>
    </button>
  </a>
));

const SocialLink = memo(({ icon: Icon, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer">
    <button className="group relative p-3">
      <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <div className="relative rounded-xl bg-bg-secondary/70 backdrop-blur-xl p-2 flex items-center justify-center border border-[var(--border-color)] group-hover:border-[var(--border-color-strong)] transition-all duration-300">
        <Icon className="w-5 h-5 text-text-secondary group-hover:text-[var(--text-primary)] transition-colors" />
      </div>
    </button>
  </a>
));

// Constants
const TYPING_SPEED = 100;
const ERASING_SPEED = 50;
const PAUSE_DURATION = 2000;
const WORDS = ["Passionate about Software Innovation", "Tech Enthusiast"];
const TECH_STACK = ["ReactJs", "JavaScript/TypeScript", "Node.js", "Docker", "Tailwind"];
const SOCIAL_LINKS = [
  { icon: Github, link: "https://github.com/AhmadAltamash" },
  { icon: Linkedin, link: "https://www.linkedin.com/in/altamashahmad02/" },
  { icon: Instagram, link: "https://www.instagram.com/altamash_ahmad.02/" }
];

const Home = () => {
  const [text, setText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    setIsLoaded(true);
    return () => setIsLoaded(false);
  }, []);

  // Optimize typing effect
  const handleTyping = useCallback(() => {
    if (isTyping) {
      if (charIndex < WORDS[wordIndex].length) {
        setText(prev => prev + WORDS[wordIndex][charIndex]);
        setCharIndex(prev => prev + 1);
      } else {
        setTimeout(() => setIsTyping(false), PAUSE_DURATION);
      }
    } else {
      if (charIndex > 0) {
        setText(prev => prev.slice(0, -1));
        setCharIndex(prev => prev - 1);
      } else {
        setWordIndex(prev => (prev + 1) % WORDS.length);
        setIsTyping(true);
      }
    }
  }, [charIndex, isTyping, wordIndex]);

  useEffect(() => {
    const timeout = setTimeout(
      handleTyping,
      isTyping ? TYPING_SPEED : ERASING_SPEED
    );
    return () => clearTimeout(timeout);
  }, [handleTyping, isTyping]);

  // Lottie configuration
  const lottieOptions = {
    src: "https://lottie.host/58753882-bb6a-49f5-a2c0-950eda1e135a/NLbpVqGegK.lottie",
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
      progressiveLoad: true,
    },
    style: { width: "100%", height: "100%" },
    className: `w-full h-full transition-all duration-500 ${
      isHovering 
        ? "scale-[180%] sm:scale-[160%] md:scale-[150%] lg:scale-[145%] rotate-2" 
        : "scale-[175%] sm:scale-[155%] md:scale-[145%] lg:scale-[140%]"
    }`
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden" id="Home">
      <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <div className="container mx-auto px-[5%] sm:px-6 lg:pl-[10%] min-h-screen pt-24 lg:pt-0">
          <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen lg:h-screen md:justify-between gap-0 sm:gap-12 lg:gap-20 pb-12 lg:pb-0">
            {/* Left Column */}
            <div className="w-full lg:w-1/2 space-y-4 sm:space-y-8 text-left lg:text-left order-1 lg:order-1 lg:mt-0"
              data-aos="fade-right"
              data-aos-delay="200">
              <div className="space-y-1 sm:space-y-6">
                <StatusBadge />
                <MainTitle />

                {/* Typing Effect */}
                <div className="h-8 flex items-center" data-aos="fade-up" data-aos-delay="800">
                  <span className="text-xl md:text-2xl subtle-gradient-text font-light">
                    {text}
                  </span>
                  <span className="w-[3px] h-6 bg-gradient-to-t from-[#6366f1] to-[#a855f7] ml-1 animate-blink"></span>
                </div>

                {/* Description */}
                <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed font-light"
                  data-aos="fade-up"
                  data-aos-delay="1000">
                  A passionate Full Stack developer from India, Eager to learn new Languages and Framework, Expertise in making User Friendly Web Pages.
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-3 justify-start" data-aos="fade-up" data-aos-delay="1200">
                  {TECH_STACK.map((tech, index) => (
                    <TechStack key={index} tech={tech} />
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-row gap-3 w-full justify-start" data-aos="fade-up" data-aos-delay="1400">
                  <CTAButton href="#Portfolio" text="Projects" icon={ExternalLink} />
                  <CTAButton href="#Contact" text="Contact" icon={Mail} />
                </div>

                {/* Social Links */}
                <div className="hidden sm:flex gap-4 justify-start" data-aos="fade-up" data-aos-delay="1600">
                  {SOCIAL_LINKS.map((social, index) => (
                    <SocialLink key={index} {...social} />
                  ))}
                </div>
              </div>
            </div>

             <div className="w-full py-[10%] sm:py-0 lg:w-1/2 h-[380px] sm:h-[450px] md:h-[550px] lg:h-[600px] xl:h-[750px] relative flex items-center justify-center order-2 lg:order-2 mt-8 lg:mt-0"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              data-aos="fade-left"
              data-aos-delay="600">
              <div className="relative w-full h-full flex items-center justify-center opacity-90">
                <div className={`absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 rounded-3xl blur-3xl transition-all duration-700 ease-in-out ${
                  isHovering ? "opacity-50 scale-105" : "opacity-20 scale-100"
                }`}>
                </div>

                <div className="relative z-10 w-full px-2">
                  <CodeEditorVisual isHovering={isHovering} />
                </div>

                <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
                  isHovering ? "opacity-50" : "opacity-20"
                }`}>
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl animate-[pulse_6s_cubic-bezier(0.4,0,0.6,1)_infinite] transition-all duration-700 ${
                    isHovering ? "scale-110" : "scale-100"
                  }`}>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Home);