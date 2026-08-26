import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Module-level so it has a stable reference across renders — the mount-only
// effect below can safely depend on it without needing to re-run on every render.
const navItems = [
    { href: "#Home", label: "Home" },
    { href: "#About", label: "About" },
    { href: "#Experience", label: "Experience" },
    { href: "#Portfolio", label: "Portfolio" },
    { href: "#Contact", label: "Contact" },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("Home");
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        // Cache each section's offset/height once (and on resize) instead
        // of re-querying the DOM and forcing a layout reflow on every
        // single scroll event — that was the main cause of the scroll
        // stutter, since offsetTop/offsetHeight reads are synchronous
        // layout operations and this ran unthrottled on every scroll tick.
        let sectionCache = [];
        let ticking = false;

        const measureSections = () => {
            sectionCache = navItems.map(item => {
                const section = document.querySelector(item.href);
                if (!section) return null;
                return {
                    id: item.href.replace("#", ""),
                    offset: section.offsetTop - 550,
                    height: section.offsetHeight,
                };
            }).filter(Boolean);
        };

        const update = () => {
            setScrolled(window.scrollY > 20);

            const currentPosition = window.scrollY;
            const active = sectionCache.find(section =>
                currentPosition >= section.offset &&
                currentPosition < section.offset + section.height
            );

            if (active) {
                setActiveSection(active.id);
            }

            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        };

        measureSections();
        update();

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", measureSections);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", measureSections);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const scrollToSection = (e, href) => {
        e.preventDefault();
        const section = document.querySelector(href);
        if (section) {
            const top = section.offsetTop - 100;
            window.scrollTo({
                top: top,
                behavior: "smooth"
            });
        }
        setIsOpen(false);
    };

    return (
        <nav
        className={`fixed w-full top-0 z-50 transition-all duration-500 ${
            isOpen
                ? "bg-[var(--bg-primary)] opacity-100"
                : scrolled
                ? "bg-bg-primary/70 backdrop-blur-xl"
                : "bg-transparent"
        }`}
    >
        <div className="mx-auto px-4 sm:px-6 lg:px-[10%]">
            <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <a
                        href="#Home"
                        onClick={(e) => scrollToSection(e, "#Home")}
                        className="text-xl font-bold bg-gradient-to-r from-[#a855f7] to-[#6366f1] bg-clip-text text-transparent"
                    >
                        Altamash Ahmad
                    </a>
                </div>
    
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center space-x-8">
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={(e) => scrollToSection(e, item.href)}
                                className="group relative px-1 py-2 text-sm font-medium"
                            >
                                <span
                                    className={`relative z-10 transition-colors duration-300 ${
                                        activeSection === item.href.substring(1)
                                            ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent font-semibold"
                                            : "text-text-secondary group-hover:text-[var(--text-primary)]"
                                    }`}
                                >
                                    {item.label}
                                </span>
                                <span
                                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] transform origin-left transition-transform duration-300 ${
                                        activeSection === item.href.substring(1)
                                            ? "scale-x-100"
                                            : "scale-x-0 group-hover:scale-x-100"
                                    }`}
                                />
                            </a>
                        ))}
                    </div>

                    <button
                        onClick={toggleTheme}
                        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                        className="p-2 rounded-full text-text-secondary hover:text-[var(--text-primary)] bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--border-color)] transition-colors"
                    >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
    
                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                        className="p-2 rounded-full text-text-secondary hover:text-[var(--text-primary)] bg-[var(--card-bg)] border border-[var(--border-color)] transition-colors"
                    >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`relative p-2 text-text-secondary hover:text-[var(--text-primary)] transition-transform duration-300 ease-in-out transform ${
                            isOpen ? "rotate-90 scale-125" : "rotate-0 scale-100"
                        }`}
                    >
                        {isOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    
        {/* Mobile Menu Overlay */}
        <div
            className={`md:hidden fixed inset-0 overflow-y-auto bg-[var(--bg-primary)] transition-all duration-300 ease-in-out ${
                isOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-[-100%] pointer-events-none"
            }`}
            style={{ top: "64px" }}
        >
            <div className="flex flex-col h-full">
                <div className="px-4 py-6 space-y-4 flex-1 ">
                    {navItems.map((item, index) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(e) => scrollToSection(e, item.href)}
                            className={`block px-4 py-3 text-lg font-medium transition-all duration-300 ease ${
                                activeSection === item.href.substring(1)
                                    ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent font-semibold"
                                    : "text-text-primary/80 hover:text-[var(--text-primary)]"
                            }`}
                            style={{
                                transitionDelay: `${index * 100}ms`,
                                transform: isOpen ? "translateX(0)" : "translateX(50px)",
                                opacity: isOpen ? 1 : 0,
                            }}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </nav>
    
    );
};

export default Navbar;