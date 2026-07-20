/**
 * Asset CDN / base URL for albums & covers.
 * Empty = same-origin (local dev).
 * Production can use GitHub raw or a CDN.
 */
export const ASSET_BASE = "";

/** Optional production base (set on deploy if needed) */
export const PROD_ASSET_BASE =
  "https://raw.githubusercontent.com/L-S-CAPITAL/cinem5/main";

export function assetUrl(path) {
  const base = ASSET_BASE || (typeof location !== "undefined" && location.hostname.includes("vercel.app")
    ? PROD_ASSET_BASE
    : "");
  if (!base) return path;
  const p = path.replace(/^\.\//, "");
  return `${base.replace(/\/$/, "")}/${p}`;
}
