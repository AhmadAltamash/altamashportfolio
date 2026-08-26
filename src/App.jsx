import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, Suspense, lazy } from 'react';
import "./index.css";
import AOS from "aos";
import "aos/dist/aos.css";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Experience from "./Pages/Experience";
import AnimatedBackground from "./components/Background";
import Navbar from "./components/Navbar";
import WelcomeScreen from "./Pages/WelcomeScreen";
import ThankYouPage from "./Pages/ThankYou";
import JoinAvailabilityButton from "./components/JoinAvailabilityButton";
import { AnimatePresence } from 'framer-motion';
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AdminRoute from "./components/AdminRoute";

// Portfolio (MUI + react-swipeable-views) and the project detail page are
// two of the heaviest chunks in the app — lazy-loading them means the
// initial page load only pulls in what's needed above the fold.
const Portofolio = lazy(() => import("./Pages/Portofolio"));
const ContactPage = lazy(() => import("./Pages/Contact"));
const ProjectDetails = lazy(() => import("./components/ProjectDetail"));

// Admin panel is lazy-loaded: visitors browsing the public site never
// download this code, keeping the main bundle smaller for them.
const AdminLogin = lazy(() => import("./Pages/Admin/AdminLogin"));
const AdminLayout = lazy(() => import("./Pages/Admin/AdminLayout"));
const AdminProjects = lazy(() => import("./Pages/Admin/AdminProjects"));
const AdminCertificates = lazy(() => import("./Pages/Admin/AdminCertificates"));
const AdminExperience = lazy(() => import("./Pages/Admin/AdminExperience"));
const AdminSettings = lazy(() => import("./Pages/Admin/AdminSettings"));

const AdminFallback = () => (
  <div className="min-h-screen bg-[#030014] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

const SectionFallback = () => (
  <div className="w-full flex items-center justify-center py-24">
    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

const LandingPage = ({ showWelcome, setShowWelcome }) => {
  return (
    <>
      {/* The welcome screen overlays on top (it's `fixed inset-0` with a
          high z-index) rather than gating what's underneath — the real
          content below is always in the DOM from first paint. Previously
          this whole block only rendered once showWelcome became false,
          which meant search engine crawlers (and anyone whose JS is slow
          to run the dismiss timer) could see an empty shell with no actual
          page content. */}
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      <Navbar />
      <AnimatedBackground />
      <Home />
      <About />
      <Experience />
      <Suspense fallback={<SectionFallback />}>
        <Portofolio />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ContactPage />
      </Suspense>
      <footer>
        <center>
          <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
          <span className="block text-sm pb-4 text-[var(--text-secondary)] text-center">
            © 2026{" "}
            <a href="/" className="hover:underline cursor-pointer">
              Altamash
            </a>
            . All Rights Reserved.
          </span>
        </center>
      </footer>
      <JoinAvailabilityButton />
    </>
  );
};

const ProjectPageLayout = () => (
  <>
    <Suspense fallback={<SectionFallback />}>
      <ProjectDetails />
    </Suspense>
    <footer>
      <center>
        <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
        <span className="block text-sm pb-4 text-[var(--text-secondary)] text-center">
          © 2026{" "}
          <a href="/" className="hover:underline">
            Altamash
          </a>
          . All Rights Reserved.
        </span>
      </center>
    </footer>
    <JoinAvailabilityButton />
  </>
);

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  // A single AOS instance for the whole app. Previously 7 different
  // components each called AOS.init() independently — each call attaches
  // its own scroll listener, so every scroll tick was doing several times
  // more work than necessary. once:true also means entrance animations
  // play once instead of replaying on every scroll-direction change,
  // which is lighter and reads as more polished anyway.
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 900,
      offset: 40,
      mirror: false,
    });
  }, []);

  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />} />
          <Route path="/project/:id" element={<ProjectPageLayout />} />
          <Route path="/thank-you" element={<ThankYouPage />} />

          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminLogin />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              </Suspense>
            }
          >
            <Route index element={<AdminProjects />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="experience" element={<AdminExperience />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

export default App;
