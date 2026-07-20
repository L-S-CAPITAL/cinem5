import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SHOTS, BUNDLES } from "./content/catalog.js";
import {
  applyUnlockQuery,
  checkoutUrl,
  formatPrice,
  initAgeGate,
  isAgeVerified,
  isUnlocked,
} from "./content/monetization.js";

// ─── Shot Deck UI ────────────────────────────────────────
const deckScroll = document.getElementById("deck-scroll");
const bodyEl = document.body;

function albumPaths(folder, count) {
  // Prefer local .jpg; fall back to .jpg.b64 (text-safe for git hosts without binary push)
  return Array.from({ length: count }, (_, i) => {
    const base = `shots/albums/${folder}/${String(i + 1).padStart(2, "0")}`;
    return { jpg: `${base}.jpg`, b64: `${base}.jpg.b64` };
  });
}

const albumUriCache = new Map();

async function resolveAlbumUri(entry) {
  const key = entry.jpg;
  if (albumUriCache.has(key)) return albumUriCache.get(key);
  // Try binary jpg first (local dev), then base64 sidecar (GitHub text push)
  try {
    const r = await fetch(entry.jpg, { method: "HEAD" });
    if (r.ok) {
      albumUriCache.set(key, entry.jpg);
      return entry.jpg;
    }
  } catch (_) {}
  const b64 = await fetch(entry.b64).then((r) => {
    if (!r.ok) throw new Error(`Missing album frame ${entry.b64}`);
    return r.text();
  });
  const uri = `data:image/jpeg;base64,${b64.trim()}`;
  albumUriCache.set(key, uri);
  return uri;
}

function albumMarkup(shot, unlocked) {
  const album = shot.album;
  if (!album) {
    if (shot.access === "paid" && !shot.albumReady) {
      return `
        <div class="album-block album-coming">
          <div class="album-head"><h4>Album packing</h4><span>Soon</span></div>
          <p class="album-note">10-frame album + PDF cheat sheet shipping for this pack. Unlock now to get settings forever and album on release.</p>
        </div>`;
    }
    return "";
  }

  if (!unlocked) {
    // Preview first frame only, rest locked
    const first = albumPaths(album.folder, 1)[0];
    return `
      <div class="album-block album-locked">
        <div class="album-head">
          <h4>${album.title}</h4>
          <span class="price-pill">${formatPrice(shot.price)}</span>
        </div>
        <p class="album-note">${album.note}</p>
        <div class="album-grid locked-grid">
          <button type="button" class="album-thumb preview" data-album="${album.folder}" data-index="0" aria-label="Preview frame 1">
            <img data-jpg="${first.jpg}" data-b64="${first.b64}" alt="" loading="lazy" />
          </button>
          ${Array.from({ length: Math.min(9, album.count - 1) }, () => `<div class="album-lock-tile" aria-hidden="true">🔒</div>`).join("")}
        </div>
        <a class="unlock-btn" href="${checkoutUrl(shot.packSku)}" data-sku="${shot.packSku}">Unlock pack · ${formatPrice(shot.price)}</a>
      </div>`;
  }

  const paths = albumPaths(album.folder, album.count);
  const thumbs = paths
    .map(
      (entry, i) => `
      <button type="button" class="album-thumb" data-album="${album.folder}" data-index="${i}" aria-label="Open photo ${i + 1}">
        <img data-jpg="${entry.jpg}" data-b64="${entry.b64}" alt="" loading="lazy" />
      </button>`
    )
    .join("");
  return `
    <div class="album-block">
      <div class="album-head">
        <h4>${album.title}</h4>
        <span class="owned-pill">Owned</span>
      </div>
      <p class="album-note">${album.note}</p>
      <div class="album-grid">${thumbs}</div>
    </div>`;
}

function packBarMarkup(shot, unlocked) {
  if (shot.access === "free") {
    return `<div class="pack-bar free"><span class="price-pill free">Free look</span></div>`;
  }
  if (unlocked) {
    return `<div class="pack-bar owned"><span class="owned-pill">Unlocked</span><span class="sku">${shot.packSku}</span></div>`;
  }
  return `
    <div class="pack-bar">
      ${shot.nsfw ? `<span class="nsfw-pill">18+</span>` : ""}
      <span class="price-pill">${formatPrice(shot.price)}</span>
      <a class="unlock-btn compact" href="${checkoutUrl(shot.packSku)}" data-sku="${shot.packSku}">Unlock</a>
    </div>`;
}

async function hydrateAlbumThumbs(root = document) {
  const imgs = root.querySelectorAll("img[data-b64]");
  await Promise.all(
    [...imgs].map(async (img) => {
      if (img.dataset.hydrated) return;
      try {
        const uri = await resolveAlbumUri({ jpg: img.dataset.jpg, b64: img.dataset.b64 });
        img.src = uri;
        img.dataset.hydrated = "1";
      } catch (err) {
        console.warn(err);
      }
    })
  );
}

function renderShots() {
  const ageOk = isAgeVerified();
  deckScroll.innerHTML = SHOTS.map((s, i) => {
    const unlocked = isUnlocked(s);
    const hideNsfwCover = s.nsfw && !ageOk;
    return `
    <article class="shot-card${i === 0 ? " active" : ""}${s.nsfw ? " nsfw" : ""}${unlocked ? " unlocked" : " locked"}" data-id="${s.id}" data-sku="${s.packSku || ""}" tabindex="0">
      <div class="shot-thumb${hideNsfwCover ? " blurred" : ""}">
        <img src="${s.img}" alt="${s.title}" loading="lazy" />
        <span class="shot-tag">${s.tag}${s.albumReady ? " · Album" : ""}${s.nsfw ? " · 18+" : ""}</span>
        ${!unlocked && s.access === "paid" ? `<span class="lock-badge">Pack</span>` : ""}
      </div>
      <div class="shot-body">
        <h3>${s.title}</h3>
        ${packBarMarkup(s, unlocked)}
        <p class="why">${s.blurb}</p>
        <div class="settings-row">
          <div class="setting">
            <span class="label">Aperture</span>
            <span class="val accent">${s.f}</span>
          </div>
          <div class="setting">
            <span class="label">ISO</span>
            <span class="val">${s.iso}</span>
          </div>
          <div class="setting">
            <span class="label">Shutter</span>
            <span class="val">${s.ss}</span>
          </div>
        </div>
        <p class="shot-explain">${s.explain}</p>
        <div class="mode-pill">${s.modes.map((m) => `<span>${m}</span>`).join("")}</div>
        ${s.nsfw && !ageOk ? `<p class="album-note age-hint">Confirm 18+ to preview intimate albums.</p>` : albumMarkup(s, unlocked)}
      </div>
    </article>`;
  }).join("");

  // Bundle strip at top of deck scroll (inject before first card)
  const bundleHtml = `
    <div class="bundle-strip">
      <h3 class="bundle-title">Packs &amp; bundles</h3>
      <p class="bundle-sub">Every look is a pack. Unlock one, or grab a bundle for creators who shoot often.</p>
      <div class="bundle-row">
        ${BUNDLES.map(
          (b) => `
          <a class="bundle-card${b.nsfw ? " nsfw" : ""}" href="${checkoutUrl(b.sku)}">
            <strong>${b.title}</strong>
            <span class="price-pill">${formatPrice(b.price)}</span>
            <em>${b.blurb}</em>
          </a>`
        ).join("")}
      </div>
    </div>`;
  deckScroll.insertAdjacentHTML("afterbegin", bundleHtml);

  deckScroll.querySelectorAll(".shot-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".album-thumb, .unlock-btn, a")) return;
      selectShot(card.dataset.id);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectShot(card.dataset.id);
      }
    });
  });

  deckScroll.querySelectorAll(".album-thumb").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openLightbox(btn.dataset.album, Number(btn.dataset.index));
    });
  });

  // Demo unlock: long-press isn't needed; support data-demo on checkout hashes
  deckScroll.querySelectorAll(".unlock-btn").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      // Placeholder checkout: simulate unlock for local demo when hash checkout
      if (href.startsWith("#checkout-")) {
        e.preventDefault();
        const sku = a.dataset.sku;
        if (sku && confirm(`Demo unlock “${sku}”? (Set checkout-config.js to external + real URLs for live sales.)`)) {
          import("./content/monetization.js").then((m) => {
            if (sku.startsWith("bundle-")) m.grantBundle(sku);
            else m.grantPack(sku);
            renderShots();
          });
        }
      }
    });
  });

  const active = deckScroll.querySelector(".shot-card.active");
  if (active) hydrateAlbumThumbs(active);
}

function selectShot(id) {
  deckScroll.querySelectorAll(".shot-card").forEach((c) => {
    c.classList.toggle("active", c.dataset.id === id);
  });
  const card = deckScroll.querySelector(`[data-id="${id}"]`);
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    hydrateAlbumThumbs(card);
  }
}

// ─── Lightbox ────────────────────────────────────────────
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lb-img");
const lbMeta = document.getElementById("lb-meta");
let lbAlbum = null;
let lbIndex = 0;
let lbEntries = [];

async function openLightbox(folder, index) {
  const shot = SHOTS.find((s) => s.album && s.album.folder === folder);
  if (!shot) return;
  if (shot.nsfw && !isAgeVerified()) return;
  const unlocked = isUnlocked(shot);
  // Locked: only index 0 preview
  if (!unlocked && index > 0) {
    window.location.href = checkoutUrl(shot.packSku);
    return;
  }
  lbAlbum = shot.album;
  const count = unlocked ? shot.album.count : 1;
  lbEntries = albumPaths(folder, count);
  lbIndex = Math.min(index, count - 1);
  await showLightboxFrame();
  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
}

async function showLightboxFrame() {
  if (!lbEntries.length) return;
  lbImg.src = await resolveAlbumUri(lbEntries[lbIndex]);
  lbMeta.innerHTML = `<strong>${lbAlbum.title}</strong> · ${lbIndex + 1} / ${lbEntries.length}`;
}

function closeLightbox() {
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  lbImg.removeAttribute("src");
}

function lbStep(dir) {
  if (!lbEntries.length) return;
  lbIndex = (lbIndex + dir + lbEntries.length) % lbEntries.length;
  showLightboxFrame();
}

document.getElementById("lb-close")?.addEventListener("click", closeLightbox);
document.getElementById("lb-prev")?.addEventListener("click", () => lbStep(-1));
document.getElementById("lb-next")?.addEventListener("click", () => lbStep(1));
lb?.addEventListener("click", (e) => {
  if (e.target === lb) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (!lb?.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") lbStep(-1);
  if (e.key === "ArrowRight") lbStep(1);
});

function openDeck() {
  bodyEl.classList.add("deck-open");
  document.getElementById("shot-deck").setAttribute("aria-hidden", "false");
}

function closeDeck() {
  bodyEl.classList.remove("deck-open");
  document.getElementById("shot-deck").setAttribute("aria-hidden", "true");
}

document.getElementById("open-deck").addEventListener("click", openDeck);
document.getElementById("open-deck-2")?.addEventListener("click", openDeck);
document.getElementById("close-deck").addEventListener("click", closeDeck);
document.getElementById("deck-backdrop").addEventListener("click", closeDeck);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lb?.classList.contains("open")) closeDeck();
});

// Soft unlocks from checkout return + demo
const granted = applyUnlockQuery();
if (granted.length) {
  console.info("FrameDeck unlocked:", granted.join(", "));
}

initAgeGate({
  onVerified: () => renderShots(),
});

renderShots();

// Waitlist form
document.getElementById("waitlist-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = new FormData(e.target).get("email");
  const note = document.getElementById("waitlist-note");
  if (note) {
    note.hidden = false;
    note.textContent = `You're on the list${email ? ` (${email})` : ""}. We'll ping you when packs go live.`;
  }
  e.target.reset();
  // Persist interest
  try {
    const list = JSON.parse(localStorage.getItem("framedeck_waitlist") || "[]");
    if (email) list.push({ email, at: Date.now() });
    localStorage.setItem("framedeck_waitlist", JSON.stringify(list));
  } catch (_) {}
});

// ═══════════════════════════════════════════════════════════
// THREE.JS — EOS M5 + EF-M 22mm f/2 STM pancake
// ═══════════════════════════════════════════════════════════
const wrap = document.getElementById("canvas-wrap");
const loaderEl = document.getElementById("loader");
const progressEl = document.getElementById("load-progress");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0b);
scene.fog = new THREE.FogExp2(0x0a0a0b, 0.045);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3.2, 1.4, 4.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
wrap.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2.0;
controls.maxDistance = 9;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0, 0.15, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.28, 0.4, 0.85);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// Lights
const key = new THREE.DirectionalLight(0xfff5ee, 3.2);
key.position.set(4, 6, 3);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 20;
key.shadow.camera.left = -4;
key.shadow.camera.right = 4;
key.shadow.camera.top = 4;
key.shadow.camera.bottom = -4;
key.shadow.bias = -0.0003;
scene.add(key);

const fill = new THREE.DirectionalLight(0xb8c4ff, 0.9);
fill.position.set(-4, 2, -2);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xff3355, 1.4);
rim.position.set(-2, 1.5, -4);
scene.add(rim);

scene.add(new THREE.HemisphereLight(0x8899aa, 0x111114, 0.55));

const redPoint = new THREE.PointLight(0xc8102e, 2.5, 8, 2);
redPoint.position.set(1.5, 0.8, 2);
scene.add(redPoint);

// Materials
const finishes = {
  black: { body: 0x1c1c1e, metal: 0x3a3a40 },
  silver: { body: 0xc8c8ce, metal: 0x8a8a92 },
};

const matBody = new THREE.MeshPhysicalMaterial({
  color: finishes.black.body, roughness: 0.42, metalness: 0.25, clearcoat: 0.35, clearcoatRoughness: 0.35,
});
const matGrip = new THREE.MeshPhysicalMaterial({ color: 0x121214, roughness: 0.92, metalness: 0.05 });
const matMetal = new THREE.MeshPhysicalMaterial({ color: finishes.black.metal, roughness: 0.28, metalness: 0.85 });
const matChrome = new THREE.MeshPhysicalMaterial({ color: 0xd0d0d8, roughness: 0.12, metalness: 1.0 });
const matBlackGloss = new THREE.MeshPhysicalMaterial({
  color: 0x0a0a0c, roughness: 0.18, metalness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.15,
});
const matLensGlass = new THREE.MeshPhysicalMaterial({
  color: 0x1a2233, roughness: 0.05, metalness: 0.2, transmission: 0.15, thickness: 0.4,
  ior: 1.5, transparent: true, opacity: 0.92, envMapIntensity: 1.5,
});
const matScreen = new THREE.MeshPhysicalMaterial({
  color: 0x0b1220, roughness: 0.15, metalness: 0.3, emissive: 0x0a1a35, emissiveIntensity: 0.35,
});
const matEVF = new THREE.MeshPhysicalMaterial({ color: 0x050508, roughness: 0.25, metalness: 0.2 });
const matRed = new THREE.MeshStandardMaterial({
  color: 0xc8102e, roughness: 0.35, metalness: 0.2, emissive: 0xc8102e, emissiveIntensity: 0.25,
});
const matDial = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1c, roughness: 0.55, metalness: 0.4 });
const matGoldRing = new THREE.MeshPhysicalMaterial({ color: 0xb8860b, roughness: 0.3, metalness: 0.9 });
const matLensSilver = new THREE.MeshPhysicalMaterial({
  color: 0xc4c4cc, roughness: 0.22, metalness: 0.75, clearcoat: 0.4, clearcoatRoughness: 0.3,
});

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cyl(rTop, rBot, h, mat, x = 0, y = 0, z = 0, segs = 48) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ─── Camera body ─────────────────────────────────────────
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const BODY_W = 2.15;
const BODY_H = 0.95;
const BODY_D = 1.05;

cameraGroup.add(box(BODY_W, BODY_H, BODY_D, matBody));
cameraGroup.add(box(BODY_W * 0.98, 0.03, BODY_D * 0.98, matBody, 0, BODY_H / 2, 0));

// Grip
cameraGroup.add(box(0.48, 0.88, 0.72, matGrip, BODY_W / 2 - 0.18, -0.02, 0.22));
for (let i = 0; i < 5; i++) {
  cameraGroup.add(box(0.42, 0.02, 0.02, matBlackGloss, BODY_W / 2 - 0.18, -0.28 + i * 0.1, 0.55));
}

// Top plate
cameraGroup.add(box(BODY_W * 0.98, 0.12, BODY_D * 0.92, matMetal, 0, BODY_H / 2 + 0.04, 0));
cameraGroup.add(box(0.32, 0.04, 0.28, matChrome, 0, BODY_H / 2 + 0.12, -0.05));
cameraGroup.add(box(0.28, 0.03, 0.22, matBlackGloss, 0, BODY_H / 2 + 0.15, -0.05));

// Mode dial
cameraGroup.add(cyl(0.16, 0.16, 0.1, matDial, -0.72, BODY_H / 2 + 0.14, -0.15, 32));
cameraGroup.add(cyl(0.12, 0.12, 0.02, matMetal, -0.72, BODY_H / 2 + 0.2, -0.15, 32));
cameraGroup.add(box(0.03, 0.015, 0.08, matRed, -0.72, BODY_H / 2 + 0.215, -0.08));

// Main dial + shutter
cameraGroup.add(cyl(0.14, 0.14, 0.08, matDial, 0.55, BODY_H / 2 + 0.13, -0.12, 32));
cameraGroup.add(cyl(0.08, 0.08, 0.05, matChrome, 0.78, BODY_H / 2 + 0.12, 0.12, 24));
cameraGroup.add(cyl(0.04, 0.04, 0.01, matRed, 0.78, BODY_H / 2 + 0.145, 0.12, 16));
cameraGroup.add(box(0.08, 0.03, 0.08, matBlackGloss, 0.35, BODY_H / 2 + 0.11, 0.22));
cameraGroup.add(box(0.08, 0.03, 0.08, matRed, 0.48, BODY_H / 2 + 0.11, 0.22));

// EVF
cameraGroup.add(box(0.72, 0.38, 0.55, matBody, 0, BODY_H / 2 + 0.28, -0.22));
const eyepiece = cyl(0.16, 0.18, 0.12, matEVF, 0, BODY_H / 2 + 0.28, -0.52, 32);
eyepiece.rotation.x = Math.PI / 2;
cameraGroup.add(eyepiece);
const eyeGlass = cyl(0.12, 0.12, 0.02, matLensGlass, 0, BODY_H / 2 + 0.28, -0.58, 32);
eyeGlass.rotation.x = Math.PI / 2;
cameraGroup.add(eyeGlass);
const eyecup = cyl(0.19, 0.17, 0.06, matGrip, 0, BODY_H / 2 + 0.28, -0.48, 32);
eyecup.rotation.x = Math.PI / 2;
cameraGroup.add(eyecup);
cameraGroup.add(box(0.55, 0.025, 0.04, matRed, 0, BODY_H / 2 + 0.48, -0.05));

// ─── EF-M 22mm f/2 STM PANCAKE LENS ───────────────────────
// Real lens is ~23.7mm deep — extremely short barrel
const lensGroup = new THREE.Group();
lensGroup.position.set(0, 0.02, BODY_D / 2);
cameraGroup.add(lensGroup);

// Mount flange on body
const mountOuter = cyl(0.48, 0.48, 0.06, matMetal, 0, 0, 0.04, 64);
mountOuter.rotation.x = Math.PI / 2;
lensGroup.add(mountOuter);

const mountInner = cyl(0.38, 0.38, 0.04, matBlackGloss, 0, 0, 0.07, 64);
mountInner.rotation.x = Math.PI / 2;
lensGroup.add(mountInner);

// Gold EF-M contacts ring
const goldRing = cyl(0.36, 0.36, 0.015, matGoldRing, 0, 0, 0.09, 64);
goldRing.rotation.x = Math.PI / 2;
lensGroup.add(goldRing);

// Pancake barrel — short silver/black cylinder (classic 22mm look)
// Outer decorative silver barrel
const pancakeBody = cyl(0.46, 0.47, 0.22, matLensSilver, 0, 0, 0.18, 64);
pancakeBody.rotation.x = Math.PI / 2;
lensGroup.add(pancakeBody);

// Slight step / focus ring band
const focusRing = cyl(0.475, 0.475, 0.08, matBlackGloss, 0, 0, 0.28, 64);
focusRing.rotation.x = Math.PI / 2;
lensGroup.add(focusRing);

// Fine focus ridges
for (let i = 0; i < 12; i++) {
  const ridge = cyl(0.478, 0.478, 0.008, matGrip, 0, 0, 0.245 + i * 0.007, 48);
  ridge.rotation.x = Math.PI / 2;
  lensGroup.add(ridge);
}

// Front silver ring with "22mm 1:2" aesthetic
const frontRing = cyl(0.45, 0.45, 0.04, matChrome, 0, 0, 0.34, 64);
frontRing.rotation.x = Math.PI / 2;
lensGroup.add(frontRing);

// Black front bevel
const frontBevel = cyl(0.40, 0.42, 0.03, matBlackGloss, 0, 0, 0.37, 64);
frontBevel.rotation.x = Math.PI / 2;
lensGroup.add(frontBevel);

// Front element glass
const frontGlass = cyl(0.34, 0.34, 0.035, matLensGlass, 0, 0, 0.39, 64);
frontGlass.rotation.x = Math.PI / 2;
lensGroup.add(frontGlass);

// Multi-coat reflections
const coat1 = new THREE.Mesh(
  new THREE.CircleGeometry(0.3, 48),
  new THREE.MeshPhysicalMaterial({
    color: 0x3366cc, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.4, side: THREE.DoubleSide,
  })
);
coat1.position.set(0, 0, 0.41);
lensGroup.add(coat1);

const coat2 = new THREE.Mesh(
  new THREE.CircleGeometry(0.16, 32),
  new THREE.MeshPhysicalMaterial({
    color: 0xcc4455, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.28, side: THREE.DoubleSide,
  })
);
coat2.position.set(0.05, 0.04, 0.415);
lensGroup.add(coat2);

// STM badge area (tiny red accent near barrel)
lensGroup.add(box(0.12, 0.04, 0.01, matRed, 0.42, 0.12, 0.2));

// AF lamp
cameraGroup.add(box(0.08, 0.08, 0.04, matChrome, -0.55, 0.25, BODY_D / 2 + 0.01));

// Front logo plate
cameraGroup.add(box(0.5, 0.12, 0.02, matMetal, 0.55, 0.28, BODY_D / 2 + 0.01));

// Rear LCD
cameraGroup.add(box(1.15, 0.78, 0.06, matBlackGloss, -0.15, 0.02, -BODY_D / 2 - 0.02));
cameraGroup.add(box(1.0, 0.65, 0.02, matScreen, -0.15, 0.02, -BODY_D / 2 - 0.05));
const screenUI = new THREE.Mesh(
  new THREE.PlaneGeometry(0.92, 0.58),
  new THREE.MeshBasicMaterial({ color: 0x0e1a2e })
);
screenUI.position.set(-0.15, 0.02, -BODY_D / 2 - 0.06);
cameraGroup.add(screenUI);
cameraGroup.add(box(0.25, 0.04, 0.005, matRed, -0.4, 0.22, -BODY_D / 2 - 0.065));

// Rear controls
const rearDial = cyl(0.14, 0.14, 0.05, matDial, 0.72, -0.05, -BODY_D / 2 - 0.02, 32);
rearDial.rotation.x = Math.PI / 2;
cameraGroup.add(rearDial);
cameraGroup.add(box(0.45, 0.15, 0.2, matGrip, 0.7, 0.35, -BODY_D / 2 + 0.15));
[
  [0.72, 0.25], [0.72, 0.12], [0.55, 0.25], [0.55, 0.12], [0.72, -0.28], [0.55, -0.28],
].forEach(([x, y]) => cameraGroup.add(box(0.1, 0.08, 0.03, matBlackGloss, x, y, -BODY_D / 2 - 0.01)));

cameraGroup.add(box(0.04, 0.45, 0.35, matMetal, -BODY_W / 2 - 0.01, 0, 0.1));
cameraGroup.add(box(0.7, 0.04, 0.55, matMetal, 0.35, -BODY_H / 2 - 0.02, 0.05));
cameraGroup.add(cyl(0.04, 0.04, 0.12, matChrome, BODY_W / 2 - 0.05, 0.35, 0, 12));
cameraGroup.add(cyl(0.04, 0.04, 0.12, matChrome, -BODY_W / 2 + 0.05, 0.35, 0, 12));

// Labels
function makeLabelTexture(text, opts = {}) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = opts.color || "#c8102e";
  ctx.font = `bold ${opts.size || 64}px "Bebas Neue", Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const canonLogo = new THREE.Mesh(
  new THREE.PlaneGeometry(0.55, 0.14),
  new THREE.MeshBasicMaterial({ map: makeLabelTexture("Canon", { color: "#e8e8ec", size: 72 }), transparent: true })
);
canonLogo.position.set(0.55, 0.28, BODY_D / 2 + 0.025);
cameraGroup.add(canonLogo);

const eosLabel = new THREE.Mesh(
  new THREE.PlaneGeometry(0.4, 0.1),
  new THREE.MeshBasicMaterial({ map: makeLabelTexture("EOS M5", { color: "#c8102e", size: 56 }), transparent: true })
);
eosLabel.position.set(-0.55, -0.28, BODY_D / 2 + 0.02);
cameraGroup.add(eosLabel);

// Lens ring text (around front)
const lensLabel = new THREE.Mesh(
  new THREE.PlaneGeometry(0.55, 0.1),
  new THREE.MeshBasicMaterial({
    map: makeLabelTexture("EF-M 22mm 1:2", { color: "#1a1a1c", size: 48 }),
    transparent: true,
  })
);
lensLabel.position.set(0, -0.42, 0.22);
lensLabel.rotation.x = -0.3;
lensGroup.add(lensLabel);

// Pedestal
const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(1.6, 1.8, 0.06, 64),
  new THREE.MeshPhysicalMaterial({ color: 0x121214, roughness: 0.35, metalness: 0.6, clearcoat: 0.5 })
);
pedestal.position.y = -0.72;
pedestal.receiveShadow = true;
scene.add(pedestal);

const ringLight = new THREE.Mesh(
  new THREE.TorusGeometry(1.55, 0.015, 16, 100),
  new THREE.MeshStandardMaterial({ color: 0xc8102e, emissive: 0xc8102e, emissiveIntensity: 1.2, roughness: 0.4 })
);
ringLight.rotation.x = Math.PI / 2;
ringLight.position.y = -0.68;
scene.add(ringLight);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(6, 64),
  new THREE.MeshStandardMaterial({ color: 0x080809, roughness: 1, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.75;
ground.receiveShadow = true;
scene.add(ground);

// Particles
const particleCount = 80;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  pPos[i * 3] = (Math.random() - 0.5) * 10;
  pPos[i * 3 + 1] = Math.random() * 4 - 0.5;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
const particles = new THREE.Points(
  pGeo,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.015, transparent: true, opacity: 0.35, sizeAttenuation: true })
);
scene.add(particles);

// Views
const views = {
  hero: { pos: new THREE.Vector3(3.2, 1.4, 4.2), target: new THREE.Vector3(0, 0.15, 0) },
  front: { pos: new THREE.Vector3(0.15, 0.35, 4.2), target: new THREE.Vector3(0, 0.08, 0.2) },
  top: { pos: new THREE.Vector3(0.5, 4.2, 1.2), target: new THREE.Vector3(0, 0.2, 0) },
  lens: { pos: new THREE.Vector3(0.8, 0.45, 2.4), target: new THREE.Vector3(0, 0.05, 0.7) },
};

function goToView(name) {
  const v = views[name];
  if (!v) return;
  controls.autoRotate = false;
  document.getElementById("auto-rotate-btn").textContent = "Auto Rotate";
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const t0 = performance.now();
  const dur = 900;
  function step(now) {
    const t = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(startPos, v.pos, e);
    controls.target.lerpVectors(startTarget, v.target, e);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll(".view-toggles button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".view-toggles button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    goToView(btn.dataset.view);
  });
});

function applyFinish(name) {
  const f = finishes[name];
  matBody.color.setHex(f.body);
  matMetal.color.setHex(f.metal);
  document.querySelectorAll(".swatch").forEach((s) => {
    s.classList.toggle("active", s.dataset.finish === name);
  });
}

document.querySelectorAll(".swatch").forEach((s) => {
  s.addEventListener("click", () => applyFinish(s.dataset.finish));
});

document.getElementById("auto-rotate-btn").addEventListener("click", (e) => {
  controls.autoRotate = !controls.autoRotate;
  e.target.textContent = controls.autoRotate ? "Stop Rotate" : "Auto Rotate";
});

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloom.setSize(w, h);
}
window.addEventListener("resize", onResize);

let loadP = 0;
function simulateLoad() {
  loadP = Math.min(100, loadP + Math.random() * 18 + 8);
  progressEl.style.width = loadP + "%";
  if (loadP < 100) setTimeout(simulateLoad, 80);
  else setTimeout(() => loaderEl.classList.add("hide"), 200);
}
simulateLoad();

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  cameraGroup.position.y = Math.sin(t * 0.7) * 0.03;
  cameraGroup.rotation.z = Math.sin(t * 0.4) * 0.01;
  particles.rotation.y = t * 0.02;
  const arr = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) arr[i * 3 + 1] += Math.sin(t + i) * 0.0003;
  particles.geometry.attributes.position.needsUpdate = true;
  matScreen.emissiveIntensity = 0.3 + Math.sin(t * 1.5) * 0.08;
  redPoint.intensity = 2.2 + Math.sin(t * 1.2) * 0.4;
  controls.update();
  composer.render();
}
animate();
