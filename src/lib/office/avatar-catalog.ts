/**
 * Retro Lofi Pixel Avatar Catalog & Procedural Canvas Rendering Engine
 * 10 Hairstyles, 10 Outfits, 10 Accessories, 10 Pets, 10 Skin tones, 10 Hair colors, 10 Outfit colors
 * Supports 7 Animations (idle, walk, work, coffee, wave, cheer, sleep) and 4 Directions (down, up, left, right)
 */

export interface CatalogItem {
  id: string;
  name: string;
  nameTh: string;
  icon: string;
}

export interface ColorItem {
  id: string;
  name: string;
  value: string;
}

export type AvatarAnimation = "idle" | "walk" | "work" | "coffee" | "wave" | "cheer" | "sleep";
export type AvatarDirection = "down" | "up" | "left" | "right";

export interface AvatarConfig {
  skinToneId: string;
  hairstyleId: string;
  hairColorId: string;
  outfitId: string;
  outfitColorId: string;
  accessoryId: string;
  petId: string;
  name?: string;
}

// 1. 10 Hairstyles
export const HAIRSTYLES: CatalogItem[] = [
  { id: "clean_part", name: "Clean Part", nameTh: "แสกข้างเรียบร้อย", icon: "💇" },
  { id: "messy_anime", name: "Messy Anime", nameTh: "อนิเมะชี้ฟู", icon: "🦱" },
  { id: "long_straight", name: "Long Straight", nameTh: "ยาวตรงสลวย", icon: "👩" },
  { id: "samurai_bun", name: "Samurai Bun", nameTh: "มัดจุกบน", icon: "👱" },
  { id: "classic_bob", name: "Classic Bob", nameTh: "บ็อบสั้นหน้าม้า", icon: "👧" },
  { id: "wavy_curls", name: "Wavy Curls", nameTh: "ดัดลอนมีวอลลุ่ม", icon: "👩‍🦱" },
  { id: "afro_puffs", name: "Afro Puffs", nameTh: "แอโฟรฟู", icon: "🧑‍🦱" },
  { id: "cozy_beanie", name: "Cozy Beanie", nameTh: "หมวกไหมพรม", icon: "🧶" },
  { id: "backward_cap", name: "Backward Cap", nameTh: "หมวกแก๊ปหันหลัง", icon: "🧢" },
  { id: "cyber_undercut", name: "Cyber Undercut", nameTh: "อันเดอร์คัตไซเบอร์", icon: "⚡" },
];

// 2. 10 Outfits
export const OUTFITS: CatalogItem[] = [
  { id: "lofi_hoodie", name: "Lofi Hoodie", nameTh: "ฮู้ดดี้โอเวอร์ไซส์", icon: "🧥" },
  { id: "business_suit", name: "Business Suit", nameTh: "สูทสากลผูกไท", icon: "👔" },
  { id: "knit_sweater", name: "Knit Sweater", nameTh: "สเวตเตอร์ไหมพรม", icon: "🧶" },
  { id: "graphic_tee", name: "Graphic Tee", nameTh: "เสื้อยืดเรโทร", icon: "👕" },
  { id: "flannel_shirt", name: "Flannel Shirt", nameTh: "เชิ้ตลายสก็อต", icon: "🧣" },
  { id: "bomber_jacket", name: "Bomber Jacket", nameTh: "แจ็คเก็ตบอมเบอร์", icon: "🦺" },
  { id: "denim_overalls", name: "Denim Overalls", nameTh: "ชุดเอี๊ยมยีนส์", icon: "👖" },
  { id: "lab_coat", name: "Lab Coat", nameTh: "เสื้อกาวน์วิจัย", icon: "🥼" },
  { id: "retro_yukata", name: "Retro Yukata", nameTh: "ยูกาตะเรโทร", icon: "👘" },
  { id: "neon_vest", name: "Neon Vest", nameTh: "เสื้อกั๊กนีออน", icon: "🦺" },
];

// 3. 10 Accessories
export const ACCESSORIES: CatalogItem[] = [
  { id: "none", name: "None", nameTh: "ไม่มี", icon: "⚪" },
  { id: "headphones", name: "Lo-Fi Headphones", nameTh: "หูฟังครอบหู", icon: "🎧" },
  { id: "wire_glasses", name: "Round Glasses", nameTh: "แว่นตากรอบกลม", icon: "👓" },
  { id: "cyber_shades", name: "Cyber Visor", nameTh: "แว่นตากันแดดนีออน", icon: "🕶️" },
  { id: "cat_ears", name: "Cat Ears", nameTh: "ที่คาดผมหูแมว", icon: "🐱" },
  { id: "face_mask", name: "Ninja Mask", nameTh: "หน้ากากผ้าปิดปาก", icon: "😷" },
  { id: "coffee_mug", name: "Coffee Mug", nameTh: "แก้วกาแฟร้อน", icon: "☕" },
  { id: "walkman", name: "Retro Walkman", nameTh: "ซาวด์เบาท์พกพา", icon: "📻" },
  { id: "angel_halo", name: "Angel Halo", nameTh: "วงแหวนนางฟ้า", icon: "😇" },
  { id: "party_hat", name: "Party Hat", nameTh: "หมวกปาร์ตี้", icon: "🎉" },
];

// 4. 10 Pets
export const PETS: CatalogItem[] = [
  { id: "none", name: "None", nameTh: "ไม่มี", icon: "⚪" },
  { id: "tabby_cat", name: "Tabby Cat", nameTh: "น้องแมวส้ม", icon: "🐱" },
  { id: "shiba_inu", name: "Shiba Inu", nameTh: "หมาชิบะ", icon: "🐕" },
  { id: "bunny", name: "Fluffy Bunny", nameTh: "กระต่ายขาว", icon: "🐰" },
  { id: "duck", name: "Pixel Duck", nameTh: "เป็ดเหลือง", icon: "🦆" },
  { id: "ghost", name: "Mini Ghost", nameTh: "ผีน้อย", icon: "👻" },
  { id: "drone", name: "Scout Drone", nameTh: "โดรนตรวจการ", icon: "🛸" },
  { id: "capybara", name: "Capybara", nameTh: "คาปิบาร่า", icon: "🦫" },
  { id: "black_cat", name: "Black Cat", nameTh: "แมวดำตาวาว", icon: "🐈‍⬛" },
  { id: "penguin", name: "Penguin", nameTh: "เพนกวิน", icon: "🐧" },
];

// 5. 10 Skin Tones
export const SKIN_TONES: ColorItem[] = [
  { id: "porcelain", name: "Porcelain", value: "#faebd7" },
  { id: "fair", name: "Fair", value: "#f5e8c7" },
  { id: "peach", name: "Peach", value: "#f7d5b8" },
  { id: "warm_ivory", name: "Warm Ivory", value: "#e8be99" },
  { id: "honey_tan", name: "Honey Tan", value: "#d4a373" },
  { id: "bronze", name: "Bronze", value: "#bc8a5f" },
  { id: "caramel", name: "Caramel", value: "#a47148" },
  { id: "chestnut", name: "Chestnut", value: "#8b5a2b" },
  { id: "espresso", name: "Espresso", value: "#5c3a21" },
  { id: "obsidian", name: "Obsidian", value: "#362312" },
];

// 6. 10 Hair Colors
export const HAIR_COLORS: ColorItem[] = [
  { id: "jet_black", name: "Jet Black", value: "#1a162f" },
  { id: "cocoa_brown", name: "Cocoa Brown", value: "#4a3728" },
  { id: "honey_blonde", name: "Honey Blonde", value: "#e5bd72" },
  { id: "platinum_silver", name: "Platinum Silver", value: "#d1d5db" },
  { id: "indigo_violet", name: "Indigo Violet", value: "#a9a2ff" },
  { id: "dusk_amber", name: "Dusk Amber", value: "#f59e0b" },
  { id: "neon_cyan", name: "Neon Cyan", value: "#89c7d6" },
  { id: "lofi_rose", name: "Lofi Rose", value: "#d59ab3" },
  { id: "emerald_green", name: "Emerald Green", value: "#34d399" },
  { id: "wine_red", name: "Wine Red", value: "#b91c1c" },
];

// 7. 10 Outfit Colors
export const OUTFIT_COLORS: ColorItem[] = [
  { id: "indigo_night", name: "Indigo Night", value: "#3a2f5c" },
  { id: "dusk_lavender", name: "Dusk Lavender", value: "#a9a2ff" },
  { id: "dusk_amber", name: "Dusk Amber", value: "#e5bd72" },
  { id: "dusk_cyan", name: "Dusk Cyan", value: "#89c7d6" },
  { id: "dusk_rose", name: "Dusk Rose", value: "#d59ab3" },
  { id: "midnight_slate", name: "Midnight Slate", value: "#475569" },
  { id: "forest_emerald", name: "Forest Emerald", value: "#059669" },
  { id: "crimson_ruby", name: "Crimson Ruby", value: "#e11d48" },
  { id: "sand_cream", name: "Sand Cream", value: "#f5eedc" },
  { id: "pitch_black", name: "Pitch Black", value: "#18181b" },
];

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinToneId: "fair",
  hairstyleId: "clean_part",
  hairColorId: "jet_black",
  outfitId: "lofi_hoodie",
  outfitColorId: "dusk_lavender",
  accessoryId: "headphones",
  petId: "tabby_cat",
  name: "You",
};

export function getRandomAvatarConfig(name = "Player"): AvatarConfig {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  return {
    skinToneId: pick(SKIN_TONES).id,
    hairstyleId: pick(HAIRSTYLES).id,
    hairColorId: pick(HAIR_COLORS).id,
    outfitId: pick(OUTFITS).id,
    outfitColorId: pick(OUTFIT_COLORS).id,
    accessoryId: pick(ACCESSORIES).id,
    petId: pick(PETS).id,
    name,
  };
}

export function getColorValue(colors: ColorItem[], id: string, fallback: string): string {
  return colors.find((c) => c.id === id)?.value ?? fallback;
}

/**
 * Procedural Pixel Art Avatar Renderer
 * Draws a complete avatar on Canvas2D with chosen options, direction, and animation frame
 */
export function drawAvatar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  config: AvatarConfig,
  animation: AvatarAnimation = "idle",
  direction: AvatarDirection = "down",
  frame = 0,
  scale = 1
) {
  ctx.save();
  ctx.translate(x, y);
  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  const skinColor = getColorValue(SKIN_TONES, config.skinToneId, "#f5e8c7");
  const hairColor = getColorValue(HAIR_COLORS, config.hairColorId, "#1a162f");
  const outfitColor = getColorValue(OUTFIT_COLORS, config.outfitColorId, "#a9a2ff");

  // Animation parameters
  let bob = 0;
  let legSwing = 0;
  let armSwing = 0;
  let isBlinking = false;

  switch (animation) {
    case "idle":
      bob = Math.sin(frame / 7) * 1.2;
      isBlinking = frame % 120 > 112;
      break;
    case "walk":
      bob = Math.abs(Math.sin(frame / 3.5)) * 2;
      legSwing = Math.sin(frame / 3.5) * 4;
      armSwing = Math.cos(frame / 3.5) * 3;
      isBlinking = frame % 150 > 144;
      break;
    case "work":
      bob = Math.sin(frame / 3) * 0.8;
      break;
    case "coffee":
      bob = Math.sin(frame / 8) * 0.8;
      break;
    case "wave":
      bob = Math.sin(frame / 6) * 1.2;
      break;
    case "cheer":
      bob = Math.abs(Math.sin(frame / 2.5)) * 4;
      break;
    case "sleep":
      bob = Math.sin(frame / 12) * 0.6;
      break;
  }

  // 1. Shadow beneath character
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(5, 38, 24, 7);

  // 2. Pet companion (if selected)
  if (config.petId && config.petId !== "none") {
    drawProceduralPet(ctx, -14, 25 + Math.sin((frame + 3) / 5) * 1.5, config.petId, frame);
  }

  // 3. Legs
  ctx.fillStyle = "#1e1b2e";
  if (animation === "sleep") {
    ctx.fillRect(8, 30, 8, 10);
    ctx.fillRect(18, 30, 8, 10);
  } else if (direction === "left" || direction === "right") {
    ctx.fillRect(12, 30, 6, 12 + legSwing);
    ctx.fillRect(17, 30, 6, 12 - legSwing);
  } else {
    ctx.fillRect(9, 30, 6, 13 + legSwing);
    ctx.fillRect(19, 30, 6, 13 - legSwing);
  }

  // Shoes
  ctx.fillStyle = "#0c0a17";
  ctx.fillRect(8, 41 + (animation === "walk" ? Math.max(0, legSwing) : 0), 7, 3);
  ctx.fillRect(19, 41 + (animation === "walk" ? Math.max(0, -legSwing) : 0), 7, 3);

  // 4. Body / Outfit
  drawProceduralOutfit(ctx, 8, 14 + bob, config.outfitId, outfitColor, direction, animation, frame);

  // 5. Head
  ctx.fillStyle = skinColor;
  ctx.fillRect(10, 5 + bob, 14, 13);

  // Face details (depending on direction)
  if (direction !== "up") {
    // Eyes
    if (animation === "sleep") {
      ctx.fillStyle = "#1a162f";
      ctx.fillRect(13, 11 + bob, 3, 1);
      ctx.fillRect(18, 11 + bob, 3, 1);
    } else if (isBlinking) {
      ctx.fillStyle = "#1a162f";
      ctx.fillRect(13, 11 + bob, 3, 1);
      ctx.fillRect(18, 11 + bob, 3, 1);
    } else {
      ctx.fillStyle = "#0f0c23";
      if (direction === "left") {
        ctx.fillRect(11, 10 + bob, 3, 4);
        ctx.fillRect(16, 10 + bob, 3, 4);
      } else if (direction === "right") {
        ctx.fillRect(15, 10 + bob, 3, 4);
        ctx.fillRect(20, 10 + bob, 3, 4);
      } else {
        ctx.fillRect(13, 10 + bob, 3, 4);
        ctx.fillRect(19, 10 + bob, 3, 4);
        // Eye twinkle
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(14, 10 + bob, 1, 1);
        ctx.fillRect(20, 10 + bob, 1, 1);
      }
    }

    // Mouth / Expression
    ctx.fillStyle = "#b45309";
    if (animation === "cheer") {
      ctx.fillRect(15, 15 + bob, 4, 2);
    } else if (animation === "coffee") {
      ctx.fillRect(16, 15 + bob, 3, 1);
    } else {
      ctx.fillRect(15, 16 + bob, 4, 1);
    }

    // Cheeks
    ctx.fillStyle = "rgba(244, 114, 182, 0.4)";
    ctx.fillRect(11, 13 + bob, 2, 2);
    ctx.fillRect(21, 13 + bob, 2, 2);
  }

  // 6. Hairstyle
  drawProceduralHair(ctx, 9, 3 + bob, config.hairstyleId, hairColor, direction);

  // 7. Accessory (Glasses, Hat, Headphones, etc.)
  if (config.accessoryId && config.accessoryId !== "none") {
    drawProceduralAccessory(ctx, 8, 4 + bob, config.accessoryId, direction, animation, frame);
  }

  // 8. Animation Specific Overlays
  drawAnimationOverlay(ctx, 0, bob, animation, frame);

  ctx.restore();
}

function drawProceduralHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hairId: string,
  hairColor: string,
  direction: AvatarDirection
) {
  ctx.fillStyle = hairColor;

  switch (hairId) {
    case "clean_part":
      ctx.fillRect(x + 1, y, 16, 5);
      ctx.fillRect(x, y + 2, 3, 7);
      ctx.fillRect(x + 14, y + 2, 3, 5);
      break;

    case "messy_anime":
      ctx.fillRect(x + 1, y - 2, 16, 6);
      ctx.fillRect(x - 1, y + 1, 4, 8);
      ctx.fillRect(x + 14, y + 1, 4, 8);
      // Spikes
      ctx.fillRect(x + 4, y - 4, 3, 3);
      ctx.fillRect(x + 10, y - 5, 4, 4);
      break;

    case "long_straight":
      ctx.fillRect(x + 1, y, 16, 5);
      ctx.fillRect(x - 1, y + 2, 4, 18);
      ctx.fillRect(x + 14, y + 2, 4, 18);
      if (direction === "up") {
        ctx.fillRect(x + 2, y + 4, 13, 16);
      }
      break;

    case "samurai_bun":
      ctx.fillRect(x + 1, y + 1, 16, 5);
      ctx.fillRect(x, y + 2, 3, 6);
      ctx.fillRect(x + 14, y + 2, 3, 6);
      // Top bun
      ctx.fillRect(x + 6, y - 4, 6, 6);
      ctx.fillStyle = "#e5bd72";
      ctx.fillRect(x + 7, y - 1, 4, 2); // tie
      break;

    case "classic_bob":
      ctx.fillRect(x + 1, y, 16, 6);
      ctx.fillRect(x - 1, y + 2, 4, 11);
      ctx.fillRect(x + 14, y + 2, 4, 11);
      break;

    case "wavy_curls":
      ctx.fillRect(x, y - 1, 17, 6);
      ctx.fillRect(x - 2, y + 2, 5, 14);
      ctx.fillRect(x + 14, y + 2, 5, 14);
      ctx.fillRect(x - 1, y + 13, 3, 3);
      ctx.fillRect(x + 15, y + 13, 3, 3);
      break;

    case "afro_puffs":
      ctx.fillRect(x - 3, y - 4, 23, 11);
      ctx.fillRect(x - 4, y - 2, 25, 8);
      break;

    case "cozy_beanie":
      ctx.fillStyle = hairColor;
      ctx.fillRect(x, y - 2, 17, 8);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 6, y - 5, 4, 4); // pom-pom
      break;

    case "backward_cap":
      ctx.fillStyle = hairColor;
      ctx.fillRect(x, y + 1, 17, 5);
      ctx.fillRect(x - 3, y + 4, 4, 2); // backward brim
      break;

    case "cyber_undercut":
      ctx.fillRect(x + 2, y - 2, 15, 6);
      ctx.fillRect(x + 13, y + 2, 4, 7);
      ctx.fillStyle = "#111025";
      ctx.fillRect(x, y + 3, 3, 5); // shaved side
      break;

    default:
      ctx.fillRect(x + 1, y, 16, 5);
      break;
  }
}

function drawProceduralOutfit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outfitId: string,
  color: string,
  direction: AvatarDirection,
  animation: AvatarAnimation,
  frame: number
) {
  ctx.fillStyle = color;

  // Base torso
  ctx.fillRect(x, y, 18, 16);

  // Arms
  const armSwing = animation === "walk" ? Math.sin(frame / 3.5) * 3 : 0;
  const isWaving = animation === "wave";

  if (isWaving) {
    // Left arm raised waving
    const waveOffset = Math.sin(frame / 2) * 3;
    ctx.fillRect(x - 4, y - 4 + waveOffset, 4, 10);
    ctx.fillStyle = "#f5e8c7";
    ctx.fillRect(x - 5, y - 7 + waveOffset, 5, 4); // Hand waving
    ctx.fillStyle = color;
    // Right arm normal
    ctx.fillRect(x + 18, y + 2, 4, 11);
  } else {
    ctx.fillRect(x - 4, y + 1 + armSwing, 4, 11);
    ctx.fillRect(x + 18, y + 1 - armSwing, 4, 11);
    // Hands
    ctx.fillStyle = "#f5e8c7";
    ctx.fillRect(x - 4, y + 12 + armSwing, 4, 3);
    ctx.fillRect(x + 18, y + 12 - armSwing, 4, 3);
  }

  ctx.fillStyle = color;

  // Outfit specific details
  switch (outfitId) {
    case "lofi_hoodie":
      ctx.fillStyle = "#1e1b2e";
      ctx.fillRect(x + 4, y + 3, 10, 4); // Hood pocket/opening
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(x + 6, y + 4, 1, 5); // drawstring
      ctx.fillRect(x + 11, y + 4, 1, 5);
      break;

    case "business_suit":
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 6, y + 1, 6, 6); // Shirt
      ctx.fillStyle = "#e11d48";
      ctx.fillRect(x + 8, y + 2, 2, 7); // Tie
      break;

    case "knit_sweater":
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      for (let i = 0; i < 16; i += 4) {
        ctx.fillRect(x, y + i, 18, 1);
      }
      break;

    case "graphic_tee":
      ctx.fillStyle = "#e5bd72";
      ctx.fillRect(x + 6, y + 6, 6, 5); // graphic logo
      break;

    case "flannel_shirt":
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(x + 4, y, 2, 16);
      ctx.fillRect(x + 12, y, 2, 16);
      ctx.fillRect(x, y + 6, 18, 2);
      ctx.fillRect(x, y + 11, 18, 2);
      break;

    case "bomber_jacket":
      ctx.fillStyle = "#e5bd72";
      ctx.fillRect(x + 8, y + 2, 2, 14); // brass zipper
      break;

    case "denim_overalls":
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(x + 3, y + 5, 12, 11); // straps & front
      ctx.fillRect(x + 4, y, 2, 6);
      ctx.fillRect(x + 12, y, 2, 6);
      ctx.fillStyle = "#e5bd72";
      ctx.fillRect(x + 4, y + 5, 2, 2); // buckle
      ctx.fillRect(x + 12, y + 5, 2, 2);
      break;

    case "lab_coat":
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, 18, 18);
      ctx.fillStyle = "#89c7d6";
      ctx.fillRect(x + 7, y + 2, 4, 6); // stethoscope
      break;

    case "retro_yukata":
      ctx.fillStyle = "#e5bd72";
      ctx.fillRect(x, y + 9, 18, 4); // Obi belt
      break;

    case "neon_vest":
      ctx.fillStyle = "#34d399";
      ctx.fillRect(x + 2, y + 3, 2, 10);
      ctx.fillRect(x + 14, y + 3, 2, 10);
      break;
  }
}

function drawProceduralAccessory(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  accId: string,
  direction: AvatarDirection,
  animation: AvatarAnimation,
  frame: number
) {
  switch (accId) {
    case "headphones":
      // Band over head
      ctx.fillStyle = "#1e1b2e";
      ctx.fillRect(x + 1, y - 2, 18, 3);
      // Ear cups
      ctx.fillStyle = "#e5bd72";
      ctx.fillRect(x - 1, y + 4, 4, 7);
      ctx.fillRect(x + 17, y + 4, 4, 7);
      break;

    case "wire_glasses":
      if (direction !== "up") {
        ctx.fillStyle = "#e5bd72";
        ctx.fillRect(x + 4, y + 6, 5, 4);
        ctx.fillRect(x + 11, y + 6, 5, 4);
        ctx.fillRect(x + 9, y + 7, 2, 1);
        ctx.fillStyle = "rgba(137, 199, 214, 0.4)";
        ctx.fillRect(x + 5, y + 7, 3, 2);
        ctx.fillRect(x + 12, y + 7, 3, 2);
      }
      break;

    case "cyber_shades":
      if (direction !== "up") {
        ctx.fillStyle = "#89c7d6";
        ctx.fillRect(x + 3, y + 6, 14, 4);
        ctx.fillStyle = "#090817";
        ctx.fillRect(x + 4, y + 7, 12, 2);
      }
      break;

    case "cat_ears":
      ctx.fillStyle = "#1e1b2e";
      ctx.fillRect(x + 3, y - 3, 14, 2);
      ctx.fillStyle = "#d59ab3";
      // Left ear
      ctx.fillRect(x + 2, y - 7, 4, 5);
      // Right ear
      ctx.fillRect(x + 14, y - 7, 4, 5);
      break;

    case "face_mask":
      if (direction !== "up") {
        ctx.fillStyle = "#1e1b2e";
        ctx.fillRect(x + 4, y + 10, 12, 5);
      }
      break;

    case "coffee_mug":
      ctx.fillStyle = "#e5bd72";
      ctx.fillRect(x + 18, y + 16, 6, 7);
      ctx.fillStyle = "#4a3728";
      ctx.fillRect(x + 19, y + 16, 4, 2); // Coffee
      // Steam
      const steamBob = (frame % 30) / 7;
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(x + 20, y + 13 - steamBob, 2, 2);
      break;

    case "walkman":
      ctx.fillStyle = "#89c7d6";
      ctx.fillRect(x - 4, y + 18, 5, 7);
      ctx.fillStyle = "#111025";
      ctx.fillRect(x - 3, y + 20, 3, 3);
      break;

    case "angel_halo":
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(x + 3, y - 7, 14, 3);
      ctx.clearRect(x + 5, y - 6, 10, 1);
      break;

    case "party_hat":
      ctx.fillStyle = "#a855f7";
      ctx.fillRect(x + 8, y - 9, 4, 3);
      ctx.fillRect(x + 6, y - 6, 8, 3);
      ctx.fillRect(x + 4, y - 3, 12, 3);
      ctx.fillStyle = "#e5bd72";
      ctx.fillRect(x + 9, y - 11, 2, 2); // Pompom
      break;
  }
}

function drawProceduralPet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  petId: string,
  frame: number
) {
  const bob = Math.sin(frame / 4) * 1.5;

  switch (petId) {
    case "tabby_cat":
      ctx.fillStyle = "#f97316";
      ctx.fillRect(x, y + 3 + bob, 12, 9); // body
      ctx.fillRect(x + 8, y + bob, 7, 7); // head
      ctx.fillRect(x + 9, y - 2 + bob, 2, 3); // ears
      ctx.fillRect(x + 13, y - 2 + bob, 2, 3);
      ctx.fillStyle = "#0c0a17";
      ctx.fillRect(x + 12, y + 2 + bob, 2, 2); // eye
      // Tail
      ctx.fillStyle = "#ea580c";
      ctx.fillRect(x - 2, y + 2 + bob, 3, 5);
      break;

    case "shiba_inu":
      ctx.fillStyle = "#d97706";
      ctx.fillRect(x, y + 2 + bob, 14, 10);
      ctx.fillRect(x + 9, y - 1 + bob, 8, 8);
      ctx.fillRect(x + 10, y - 3 + bob, 2, 3);
      ctx.fillRect(x + 15, y - 3 + bob, 2, 3);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 11, y + 3 + bob, 5, 4); // snout
      ctx.fillStyle = "#0c0a17";
      ctx.fillRect(x + 14, y + 3 + bob, 2, 2); // nose
      break;

    case "bunny":
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y + 4 + bob, 11, 8);
      ctx.fillRect(x + 7, y + 1 + bob, 6, 6);
      ctx.fillRect(x + 7, y - 5 + bob, 2, 6); // long ears
      ctx.fillRect(x + 10, y - 5 + bob, 2, 6);
      ctx.fillStyle = "#f472b6";
      ctx.fillRect(x + 11, y + 3 + bob, 2, 2);
      break;

    case "duck":
      ctx.fillStyle = "#facc15";
      ctx.fillRect(x, y + 4 + bob, 11, 8);
      ctx.fillRect(x + 7, y + 1 + bob, 6, 6);
      ctx.fillStyle = "#f97316";
      ctx.fillRect(x + 12, y + 3 + bob, 4, 2); // beak
      break;

    case "ghost":
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fillRect(x + 2, y - 2 + bob, 11, 13);
      ctx.fillRect(x + 1, y + bob, 13, 9);
      ctx.fillStyle = "#1e1b2e";
      ctx.fillRect(x + 5, y + 2 + bob, 2, 3); // eyes
      ctx.fillRect(x + 9, y + 2 + bob, 2, 3);
      break;

    case "drone":
      ctx.fillStyle = "#89c7d6";
      ctx.fillRect(x + 1, y - 3 + bob, 13, 6);
      ctx.fillStyle = "#1e1b2e";
      ctx.fillRect(x + 5, y - 1 + bob, 5, 2); // sensor
      // Propellers
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - 2, y - 5 + bob, 6, 2);
      ctx.fillRect(x + 11, y - 5 + bob, 6, 2);
      break;

    case "capybara":
      ctx.fillStyle = "#92400e";
      ctx.fillRect(x - 1, y + 2 + bob, 16, 11);
      ctx.fillRect(x + 11, y + 1 + bob, 8, 7);
      ctx.fillStyle = "#0c0a17";
      ctx.fillRect(x + 15, y + 3 + bob, 2, 2);
      break;

    case "black_cat":
      ctx.fillStyle = "#111025";
      ctx.fillRect(x, y + 3 + bob, 12, 9);
      ctx.fillRect(x + 8, y + bob, 7, 7);
      ctx.fillRect(x + 9, y - 2 + bob, 2, 3);
      ctx.fillRect(x + 13, y - 2 + bob, 2, 3);
      ctx.fillStyle = "#facc15"; // yellow glow eyes
      ctx.fillRect(x + 11, y + 2 + bob, 2, 2);
      break;

    case "penguin":
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(x, y + 2 + bob, 11, 11);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 3, y + 4 + bob, 6, 8); // white belly
      ctx.fillStyle = "#f97316";
      ctx.fillRect(x + 9, y + 4 + bob, 3, 2); // beak
      break;

    case "slime":
      ctx.fillStyle = "#34d399";
      ctx.fillRect(x + 1, y + 5 + Math.abs(bob), 12, 8);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 4, y + 7 + Math.abs(bob), 2, 2);
      ctx.fillRect(x + 8, y + 7 + Math.abs(bob), 2, 2);
      break;
  }
}

function drawAnimationOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  bob: number,
  animation: AvatarAnimation,
  frame: number
) {
  switch (animation) {
    case "work":
      // Laptop keyboard on lap/table
      ctx.fillStyle = "#1e1b2e";
      ctx.fillRect(x + 8, 22 + bob, 18, 5);
      ctx.fillStyle = "#89c7d6";
      ctx.fillRect(x + 10, 19 + bob, 14, 3); // glowing screen
      break;

    case "cheer":
      // Sparkles and hearts above head
      const sparkY = Math.sin(frame / 2) * 3;
      ctx.fillStyle = "#facc15";
      ctx.fillRect(x + 4, -4 + sparkY, 3, 3);
      ctx.fillRect(x + 25, -2 - sparkY, 3, 3);
      ctx.fillStyle = "#f472b6";
      ctx.fillRect(x + 14, -8 + sparkY, 4, 4); // Heart
      break;

    case "sleep":
      // Zzz floating upwards
      const zOffset = (frame % 60) / 4;
      ctx.fillStyle = "#a9a2ff";
      ctx.font = "bold 9px monospace";
      ctx.fillText("Z", x + 24, 6 - zOffset);
      ctx.font = "bold 7px monospace";
      ctx.fillText("z", x + 28, 1 - zOffset);
      break;
  }
}
