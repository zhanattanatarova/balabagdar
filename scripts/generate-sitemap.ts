// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://bala-hub.kz";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/clubs", changefreq: "daily", priority: "0.9" },
  { path: "/map", changefreq: "daily", priority: "0.9" },
  { path: "/board", changefreq: "daily", priority: "0.8" },
  { path: "/search", changefreq: "weekly", priority: "0.7" },
  { path: "/legal", changefreq: "monthly", priority: "0.3" },
];

function generateSitemap(items: SitemapEntry[]) {
  const urls = items.map((e) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      "  </url>",
    ].filter(Boolean).join("\n")
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

function readEnv(): Record<string, string> {
  const env: Record<string, string> = { ...(process.env as Record<string, string>) };
  const file = resolve(".env");
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2];
    }
  }
  return env;
}

// Adds every active club page (/club/<id>) using the public, read-only API key.
async function clubEntries(): Promise<SitemapEntry[]> {
  const env = readEnv();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  const out: SitemapEntry[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const res = await fetch(`${url}/rest/v1/clubs?select=id&is_active=eq.true&order=created_at.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + pageSize - 1}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`clubs request failed: ${res.status}`);
    const rows = (await res.json()) as { id: string }[];
    for (const r of rows) out.push({ path: `/club/${r.id}`, changefreq: "weekly", priority: "0.6" });
    if (rows.length < pageSize) break;
  }
  return out;
}

let clubs: SitemapEntry[] = [];
try {
  clubs = await clubEntries();
} catch (e) {
  console.warn("sitemap: could not load clubs, writing static pages only", e);
}
const all = [...entries, ...clubs];
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(all));
console.log(`sitemap.xml written (${all.length} entries, ${clubs.length} clubs)`);
