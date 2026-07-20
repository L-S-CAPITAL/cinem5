/**
 * Soft entitlements (localStorage) until real auth/webhooks (Phase 2).
 * Age gate for NSFW catalog.
 */
import { CHECKOUT } from "./catalog.js";

const AGE_KEY = "framedeck_age_ok";
const ENTITLEMENTS_KEY = "framedeck_entitlements";

export function isAgeVerified() {
  return localStorage.getItem(AGE_KEY) === "1";
}

export function setAgeVerified() {
  localStorage.setItem(AGE_KEY, "1");
}

export function getEntitlements() {
  try {
    const raw = localStorage.getItem(ENTITLEMENTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function grantPack(sku) {
  const set = getEntitlements();
  set.add(sku);
  localStorage.setItem(ENTITLEMENTS_KEY, JSON.stringify([...set]));
}

export function hasPack(sku) {
  if (!sku) return true;
  return getEntitlements().has(sku) || getEntitlements().has("bundle-all");
}

/** Apply ?unlocked=pack-sku or ?unlocked=pack-a,pack-b from checkout return */
export function applyUnlockQuery() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("unlocked");
  if (!raw) return [];
  const granted = [];
  raw.split(",").forEach((sku) => {
    const s = sku.trim();
    if (s) {
      grantPack(s);
      granted.push(s);
    }
  });
  // Clean URL
  params.delete("unlocked");
  const qs = params.toString();
  const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", url);
  return granted;
}

export function isUnlocked(shot) {
  if (!shot) return false;
  if (shot.access === "free") return true;
  return hasPack(shot.packSku);
}

export function checkoutUrl(sku) {
  return CHECKOUT[sku] || `#checkout-${sku}`;
}

export function formatPrice(n) {
  if (!n) return "Free";
  return `$${n}`;
}

/**
 * Wire age-gate modal DOM (expects #age-gate, #age-yes, #age-no).
 */
export function initAgeGate({ onVerified } = {}) {
  const gate = document.getElementById("age-gate");
  if (!gate) return;

  if (isAgeVerified()) {
    gate.classList.add("hidden");
    gate.setAttribute("aria-hidden", "true");
    onVerified?.();
    return;
  }

  gate.classList.remove("hidden");
  gate.setAttribute("aria-hidden", "false");

  document.getElementById("age-yes")?.addEventListener("click", () => {
    setAgeVerified();
    gate.classList.add("hidden");
    gate.setAttribute("aria-hidden", "true");
    onVerified?.();
  });

  document.getElementById("age-no")?.addEventListener("click", () => {
    window.location.href = "https://www.google.com";
  });
}
