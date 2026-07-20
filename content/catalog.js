/**
 * FrameDeck content catalog — every Shot Deck look is a sellable pack.
 * Kit: Canon EOS M5 + EF-M 22mm f/2 STM
 */
import { SHOT_URIS } from "../shots/embeds.js";

/**
 * Checkout URLs
 * Set FRAMEDECK_CHECKOUT_MODE in content/checkout-config.js:
 *   - "demo"  → in-app unlock confirm (local)
 *   - "gumroad" / "lemonsqueezy" → real product URLs below
 *
 * Replace each URL with your product link. Success URL should return to:
 *   https://YOUR_DOMAIN/?unlocked=pack-sku
 */
import { resolveCheckout } from "./checkout-config.js";

export const CHECKOUT_SKUS = [
  "pack-neon-rain",
  "pack-golden-portrait",
  "pack-macro-dew",
  "pack-jazz-bar",
  "pack-action-freeze",
  "pack-blue-hour",
  "pack-boudoir",
  "pack-erotic-bw",
  "pack-raw-flash",
  "bundle-starter",
  "bundle-intimate",
  "bundle-all",
];

/** @type {Record<string, string>} */
export const CHECKOUT = Object.fromEntries(
  CHECKOUT_SKUS.map((sku) => [sku, resolveCheckout(sku)])
);

export const BUNDLES = [
  {
    sku: "bundle-starter",
    title: "Starter bundle",
    packs: ["pack-neon-rain", "pack-golden-portrait", "pack-jazz-bar"],
    price: 29,
    blurb: "Three creator looks — neon street, golden portrait, tungsten bar.",
  },
  {
    sku: "bundle-intimate",
    title: "Intimate bundle",
    packs: ["pack-boudoir", "pack-erotic-bw", "pack-raw-flash"],
    price: 49,
    blurb: "Boudoir + erotic B&W + raw flash diary. 18+.",
    nsfw: true,
  },
  {
    sku: "bundle-all",
    title: "All packs",
    packs: [
      "pack-neon-rain",
      "pack-golden-portrait",
      "pack-macro-dew",
      "pack-jazz-bar",
      "pack-action-freeze",
      "pack-blue-hour",
      "pack-boudoir",
      "pack-erotic-bw",
      "pack-raw-flash",
    ],
    price: 89,
    blurb: "Every Shot Deck look unlocked.",
    nsfw: true,
  },
];

export const SHOTS = [
  {
    id: "neon-rain",
    packSku: "pack-neon-rain",
    title: "Neon Rain Street",
    tag: "Night · Street",
    img: SHOT_URIS["5"],
    f: "f/2",
    iso: "3200",
    ss: "1/60",
    modes: ["Av or M", "WB: Tungsten/Custom", "IS: On if available"],
    blurb: "Blade Runner sidewalk energy — wet asphalt, cyan/magenta neon, lone figure under rain.",
    explain:
      "Wide open at <strong>f/2</strong> so neon and reflections stay bright without crushing shadows. " +
      "<strong>1/60</strong> freezes light rain while allowing streaky droplets if you pan slightly; slower risks walk-cycle blur. " +
      "<strong>ISO 3200</strong> is the M5’s sweet spot for night (DIGIC 7 still clean enough with mild NR). " +
      "Expose for the neon highlights; lift shadows in post. Dual Pixel AF on the figure’s silhouette.",
    nsfw: false,
    access: "paid",
    price: 15,
    albumReady: true,
    album: {
      folder: "neon-rain",
      count: 10,
      title: "Neon rain album · 10 frames",
      note: "Night street neon & rain references.",
    },
  },
  {
    id: "golden-portrait",
    packSku: "pack-golden-portrait",
    title: "Golden Hour Portrait",
    tag: "Portrait · Magic Hour",
    img: SHOT_URIS["1"],
    f: "f/2",
    iso: "200",
    ss: "1/500",
    modes: ["Av", "AF: Face+Tracking", "Meter: Spot face"],
    blurb: "Soft rim light, creamy bokeh, intimate medium close-up — classic 35mm storytelling length.",
    explain:
      "At ~35mm equiv., step in close for intimacy. <strong>f/2</strong> separates subject from trees with smooth STM-rendered falloff. " +
      "<strong>1/500</strong> kills handshake and micro-expression blur in bright sun. " +
      "<strong>ISO 200</strong> (or 100) keeps skin buttery. Put the sun behind/side for rim light; expose for the face " +
      "(+0.3 to +0.7 EV if backlit). Avoid f/2 if both eyes must be sharp on a 3/4 angle — stop to f/2.2–f/2.8.",
    nsfw: false,
    access: "free",
    price: 0,
    albumReady: true,
    album: {
      folder: "golden-portrait",
      count: 10,
      title: "Golden hour album · 10 frames",
      note: "Portrait light & rim studies.",
    },
  },
  {
    id: "macro-dew",
    packSku: "pack-macro-dew",
    title: "Close Focus · Dew Macro",
    tag: "Macro · Detail",
    img: SHOT_URIS["4"],
    f: "f/5.6",
    iso: "400",
    ss: "1/200",
    modes: ["M or Av", "MF + focus peaking", "Timer / remote"],
    blurb: "Push the 22mm to its 0.15 m / 0.49 ft minimum — jewel-like drops and paper-thin DOF.",
    explain:
      "This lens is not 1:1 macro (max 0.21×), but at <strong>0.15 m</strong> it gets dramatically close. " +
      "At f/2, DOF is razor-thin — stop to <strong>f/5.6</strong> so a whole dew line stays sharp. " +
      "<strong>1/200</strong> + good morning light freezes leaf sway; raise ISO to 800 if cloudy. " +
      "Manual focus recommended; rock your body slightly to nail the plane of focus. Tripod helps.",
    nsfw: false,
    access: "paid",
    price: 12,
    albumReady: true,
    album: {
      folder: "macro-dew",
      count: 10,
      title: "Macro dew album · 10 frames",
      note: "Close-focus detail references.",
    },
  },
  {
    id: "jazz-bar",
    packSku: "pack-jazz-bar",
    title: "Tungsten Jazz Bar",
    tag: "Interior · Low Light",
    img: SHOT_URIS["2"],
    f: "f/2",
    iso: "2500",
    ss: "1/50",
    modes: ["M", "WB: 2800–3200K", "Silent continuous"],
    blurb: "Moody practicals, smoke, whiskey-glass hero — f/2 is why you bought this pancake.",
    explain:
      "Dim interiors are the 22mm f/2’s home turf. Stay at <strong>f/2</strong>; stop down only if the glass and bar both need sharpness. " +
      "<strong>1/50–1/60</strong> is the floor for handheld (rule of thumb ≈ 1/focal; 22mm is forgiving). " +
      "<strong>ISO 1600–3200</strong> on M5 is usable; prefer underexposing ⅓ stop vs. blowing practicals. " +
      "Focus on the nearest glass edge; let the band fall soft. Custom white balance beats Auto for tungsten+neon mix.",
    nsfw: false,
    access: "paid",
    price: 15,
    albumReady: true,
    album: {
      folder: "jazz-bar",
      count: 10,
      title: "Jazz bar album · 10 frames",
      note: "Tungsten interior mood boards.",
    },
  },
  {
    id: "action-freeze",
    packSku: "pack-action-freeze",
    title: "Urban Action Freeze",
    tag: "Action · Daylight",
    img: SHOT_URIS["6"],
    f: "f/4",
    iso: "400",
    ss: "1/1600",
    modes: ["Tv / S", "AF: Servo continuous", "Drive: High 7–9 fps"],
    blurb: "Skate mid-air, hard sun, low angle — freeze the peak of the trick.",
    explain:
      "Shutter first: <strong>1/1000–1/2000</strong> freezes airborne athletes. " +
      "Stop to <strong>f/4</strong> for enough DOF when tracking a moving subject with Dual Pixel Servo AF. " +
      "Midday sun → <strong>ISO 200–400</strong>. Pre-focus on the landing zone or track the subject’s torso. " +
      "22mm’s wide FOV is perfect for dynamic low angles that include environment + athlete.",
    nsfw: false,
    access: "paid",
    price: 12,
    albumReady: true,
    album: {
      folder: "action-freeze",
      count: 10,
      title: "Action freeze album · 10 frames",
      note: "Shutter-priority freeze frames.",
    },
  },
  {
    id: "blue-hour-land",
    packSku: "pack-blue-hour",
    title: "Blue Hour Landscape",
    tag: "Landscape · Deep Focus",
    img: SHOT_URIS["3"],
    f: "f/8",
    iso: "200",
    ss: "1/30",
    modes: ["M or Av", "Tripod", "2s timer / remote"],
    blurb: "Layered misty ridges — everything sharp from foreground grass to distant peaks.",
    explain:
      "Landscapes need depth: <strong>f/8</strong> (sweet spot for this prime) keeps near-to-far sharp without diffraction mush. " +
      "Blue hour is dim — <strong>ISO 200–400</strong> and <strong>1/15–1/60</strong> on a tripod. " +
      "Handheld? Raise ISO to 800–1600 and open to f/5.6. Focus ~⅓ into the scene (hyperfocal). " +
      "22mm ≈ 35mm gives a natural wide that still feels human, not ultra-wide distortion.",
    nsfw: false,
    access: "free",
    price: 0,
    albumReady: true,
    album: {
      folder: "blue-hour",
      count: 10,
      title: "Blue hour album · 10 frames",
      note: "Deep-focus landscape studies.",
    },
  },
  {
    id: "boudoir-soft",
    packSku: "pack-boudoir",
    title: "Boudoir Soft Light",
    tag: "Boudoir · Intimate",
    img: SHOT_URIS["7"],
    f: "f/2",
    iso: "800",
    ss: "1/160",
    modes: ["Av or M", "AF: Face+Tracking", "WB: Cloudy / 5600–6000K"],
    blurb: "Window light, silk sheets, cream palette — flattering, intimate, never clinical.",
    explain:
      "Boudoir lives on soft directional light. Place the subject near a large window; use sheer curtains as a free softbox. " +
      "<strong>f/2</strong> melts the bedroom into cream bokeh and keeps focus on eyes/shoulder line — the 22mm’s ~35mm FOV is perfect for environmental intimacy (step in, don’t stand across the room). " +
      "<strong>1/160–1/200</strong> freezes small movements on the bed; drop to 1/100 only if light forces it. " +
      "<strong>ISO 400–1600</strong> indoors is normal on the M5 — prefer raising ISO over slowing the shutter. " +
      "Expose for skin highlights (+0.3 EV if backlit). Shoot RAW; keep contrast gentle in post. Consent, warmth, and direction matter more than gear.",
    nsfw: true,
    access: "paid",
    price: 19,
    albumReady: true,
    album: {
      folder: "boudoir",
      count: 10,
      title: "Boudoir album · 10 frames",
      note: "Style references for soft intimate light. 18+.",
    },
  },
  {
    id: "erotic-bw",
    packSku: "pack-erotic-bw",
    title: "Erotic Black & White",
    tag: "Fine Art · Monochrome",
    img: SHOT_URIS["8"],
    f: "f/2.8",
    iso: "1600",
    ss: "1/125",
    modes: ["M", "Picture Style: Monochrome", "Spot meter on highlight"],
    blurb: "Chiaroscuro, film grain, high-contrast light — sensuality through shadow and form.",
    explain:
      "B&W erotic work is about <em>shape and light</em>, not color. Use a single hard or window side-light so shadows carve the frame (rumpled sheets, silhouette, negative space). " +
      "Stop to <strong>f/2.8–f/4</strong> if you need more of the form sharp; stay at f/2 for abstract isolation. " +
      "<strong>1/125</strong> is a safe handheld floor for deliberate posing. " +
      "<strong>ISO 800–3200</strong> adds grain that reads as film — on the M5, 1600 is a sweet spot; push mono contrast in-camera or convert in post from a flat RAW. " +
      "Meter the brightest skin/sheet edge and let blacks fall. Avoid flat overhead light. Shoot for curves, gesture, and negative space.",
    nsfw: true,
    access: "paid",
    price: 19,
    albumReady: true,
    album: {
      folder: "erotic-bw",
      count: 10,
      title: "Erotic B&W album · 10 frames",
      note: "Monochrome form & contrast studies. 18+.",
    },
  },
  {
    id: "raw-flash",
    packSku: "pack-raw-flash",
    title: "Raw Flash Editorial",
    tag: "Flash · TR-Style",
    img: SHOT_URIS["9"],
    f: "f/5.6",
    iso: "200",
    ss: "1/200",
    modes: ["M", "Flash: On-camera / direct", "WB: Flash / 5500K"],
    blurb: "Harsh on-camera flash, white wall, high-key skin — raw snapshot energy (Terry Richardson–adjacent).",
    explain:
      "This look is intentional “anti-studio”: direct flash, pale wall, candid stare, slightly unflattering and very alive. " +
      "Lock the shutter at <strong>1/200</strong> (M5 X-sync) so ambient goes dark-ish and the flash owns the frame. " +
      "Stop to <strong>f/5.6–f/8</strong> for zone focus and to keep flash power in a usable range. " +
      "<strong>ISO 100–400</strong> — keep base ISO so the flash, not noise, builds exposure. Dial flash power until skin is bright but not pure white (blinkies as a guide). " +
      "Stand close with the 22mm (~35mm equiv.) for that confrontational snapshot feel. No bounce, no softbox — the hard shadow on the wall is the point. " +
      "Work only with consenting adults; this style can feel invasive if the vibe isn’t mutual.",
    nsfw: true,
    access: "paid",
    price: 19,
    albumReady: true,
    album: {
      folder: "raw-flash",
      count: 10,
      title: "Raw flash diary · 10 frames",
      note: "Original TR-adjacent flash studies (not copyrighted Diaries). 18+.",
    },
  },
];
