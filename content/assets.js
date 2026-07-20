/**
 * Asset CDN / base URL for albums & covers.
 * Empty = same-origin (local, GitHub Pages, Vercel full deploys).
 * Set ASSET_BASE if albums are hosted elsewhere.
 */
export const ASSET_BASE = "";

/** Fallback if a slim deploy omits album binaries */
export const PROD_ASSET_BASE =
  "https://raw.githubusercontent.com/L-S-CAPITAL/cinem5/main";

export function assetUrl(path) {
  const p = path.replace(/^\.\//, "");
  if (ASSET_BASE) {
    return `${ASSET_BASE.replace(/\/$/, "")}/${p}`;
  }
  // Slim Vercel deploys without album JPGs: fall back to GitHub raw
  if (
    typeof location !== "undefined" &&
    location.hostname.includes("vercel.app") &&
    p.startsWith("shots/albums/")
  ) {
    return `${PROD_ASSET_BASE}/${p}`;
  }
  return path;
}
