/**
 * Pack OS — shared frame roles + helpers for look-operating-system packs.
 * Differentiator: every album frame has a production role, not just a pretty still.
 */

/** Standard 10-frame shot list for creator content batching */
export const DEFAULT_FRAME_ROLES = [
  { role: "Hero", use: "Cover / PPV thumbnail" },
  { role: "Tease", use: "Free feed scroll-stop" },
  { role: "Tease 2", use: "Story / teaser carousel" },
  { role: "Form", use: "Paid mid-tier frame" },
  { role: "Form 2", use: "Angle variant for batch" },
  { role: "Detail", use: "Aesthetic filler post" },
  { role: "Environment", use: "Story / location beat" },
  { role: "Expression", use: "Face/mood variant" },
  { role: "Drama", use: "High-contrast hero alt" },
  { role: "Candid", use: "Authenticity / diary beat" },
];

export function frameRolesFor(shot) {
  if (shot.frameRoles?.length) return shot.frameRoles;
  return DEFAULT_FRAME_ROLES;
}

export function copySettingsText(shot) {
  const lines = [
    `FrameDeck · ${shot.title}`,
    `Kit: EOS M5 + EF-M 22mm f/2 STM (~35mm FOV)`,
    ``,
    `Aperture: ${shot.f}`,
    `ISO: ${shot.iso}`,
    `Shutter: ${shot.ss}`,
    `Modes: ${(shot.modes || []).join(" · ")}`,
    ``,
  ];
  if (shot.phonePath) {
    lines.push(`Phone path: ${shot.phonePath}`, ``);
  }
  if (shot.avoid?.length) {
    lines.push(`Avoid:`, ...shot.avoid.map((a) => `• ${a}`), ``);
  }
  if (shot.shootPlan?.length) {
    lines.push(`15-min plan:`, ...shot.shootPlan.map((a, i) => `${i + 1}. ${a}`), ``);
  }
  if (shot.contentBatch) {
    lines.push(`Batch: ${shot.contentBatch}`);
  }
  lines.push(``, `framedeck · educational look OS`);
  return lines.join("\n");
}
