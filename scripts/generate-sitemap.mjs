// Regenerates public/sitemap.xml before every build, using the same
// Firestore "projects" collection the site itself reads from — so every
// /project/:id page a visitor can actually reach is discoverable by
// search engines too, without hand-maintaining the list.
//
// Runs automatically via the "prebuild" script in package.json. If
// Firestore is unreachable for any reason (offline build, misconfigured
// env, etc.) this falls back to a sitemap containing just the static
// routes and lets the build continue — a missing sitemap update should
// never be the reason a deploy fails.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = join(__dirname, "..", "public", "sitemap.xml");
const SITE_URL = "https://altamashahmad.in";

// Static, always-indexable routes. (/admin, /admin/login, and /thank-you
// are intentionally excluded — they're already noindexed via <SEO>, so
// listing them here would just contradict that.)
const STATIC_ROUTES = [{ path: "/", changefreq: "weekly", priority: "1.0" }];

const urlEntry = ({ path, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const buildSitemap = (routes) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
    .map(urlEntry)
    .join("\n")}\n</urlset>\n`;

const writeFallback = (reason) => {
  console.warn(`[generate-sitemap] ${reason} — writing static-only sitemap.`);
  writeFileSync(SITEMAP_PATH, buildSitemap(STATIC_ROUTES));
};

async function main() {
  try {
    // Every non-builtin package (dotenv, firebase) is imported dynamically,
    // inside this try block, rather than statically at the top of the file.
    // A static import that fails to resolve crashes the whole script before
    // any try/catch can run — which would abort `npm run build` entirely.
    // Dynamic import() turns that same failure into an ordinary rejection
    // this function can catch and fall back from instead.
    const { default: dotenv } = await import("dotenv");
    dotenv.config();

    const firebaseConfig = {
      apiKey: process.env.VITE_API_KEY,
      authDomain: process.env.VITE_AUTH_DOMAIN,
      projectId: process.env.VITE_PROJECT_ID,
      storageBucket: process.env.VITE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_APP_ID,
    };

    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      writeFallback("Missing VITE_API_KEY / VITE_PROJECT_ID in the environment");
      return;
    }

    const { initializeApp } = await import("firebase/app");
    const { getFirestore, collection, getDocs } = await import("firebase/firestore");

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, "projects"));

    const projectRoutes = snapshot.docs.map((doc) => ({
      path: `/project/${doc.id}`,
      changefreq: "monthly",
      priority: "0.8",
    }));

    writeFileSync(SITEMAP_PATH, buildSitemap([...STATIC_ROUTES, ...projectRoutes]));
    console.log(
      `[generate-sitemap] Wrote ${1 + projectRoutes.length} URLs (${projectRoutes.length} projects) to public/sitemap.xml`
    );
  } catch (err) {
    writeFallback(`Sitemap generation failed (${err.message})`);
  }
}

main();
