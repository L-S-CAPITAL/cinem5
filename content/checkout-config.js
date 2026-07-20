/**
 * FrameDeck checkout configuration
 *
 * MODE:
 *   "demo"         — unlock via confirm() (no payment)
 *   "external"     — use PRODUCT_URLS below (Gumroad / Lemon Squeezy / etc.)
 *
 * For Gumroad: https://gumroad.com/l/your-product
 *   After purchase, set "Redirect after purchase" to:
 *   https://YOUR_SITE/?unlocked=pack-boudoir
 *
 * For Lemon Squeezy: use the checkout URL from the product dashboard.
 *   Confirmation → redirect with unlocked SKU query param.
 */
export const CHECKOUT_MODE = "demo"; // change to "external" when live

/** Real product URLs — paste from Gumroad / Lemon Squeezy */
export const PRODUCT_URLS = {
  "pack-neon-rain": "https://framedeck.gumroad.com/l/neon-rain",
  "pack-golden-portrait": "https://framedeck.gumroad.com/l/golden-portrait",
  "pack-macro-dew": "https://framedeck.gumroad.com/l/macro-dew",
  "pack-jazz-bar": "https://framedeck.gumroad.com/l/jazz-bar",
  "pack-action-freeze": "https://framedeck.gumroad.com/l/action-freeze",
  "pack-blue-hour": "https://framedeck.gumroad.com/l/blue-hour",
  "pack-boudoir": "https://framedeck.gumroad.com/l/boudoir",
  "pack-erotic-bw": "https://framedeck.gumroad.com/l/erotic-bw",
  "pack-raw-flash": "https://framedeck.gumroad.com/l/raw-flash",
  "bundle-starter": "https://framedeck.gumroad.com/l/bundle-starter",
  "bundle-intimate": "https://framedeck.gumroad.com/l/bundle-intimate",
  "bundle-all": "https://framedeck.gumroad.com/l/bundle-all",
};

export function resolveCheckout(sku) {
  if (CHECKOUT_MODE === "external" && PRODUCT_URLS[sku]) {
    return PRODUCT_URLS[sku];
  }
  // Demo mode: hash triggers in-app unlock
  return `#checkout-${sku}`;
}
