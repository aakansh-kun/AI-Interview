import * as THREE from 'three';

/**
 * Authentic 64x64 Minecraft Skin Texture Generator.
 * Creates exact pixel-art textures following Minecraft standard skin layout with NearestFilter.
 */

function createPixelCanvas(width = 64, height = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

// Helper to fill rectangular pixel region
function fillPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// Helper to add subtle pixel noise/shading for authentic Minecraft feel
function addPixelVariation(ctx, x, y, w, h, baseColor, amount = 0.08) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(x, y, w, h);
  for (let px = x; px < x + w; px += 2) {
    for (let py = y; py < y + h; py += 2) {
      const rand = (Math.sin(px * 12.9898 + py * 78.233) * 43758.5453) % 1;
      if (rand > 0.6) {
        ctx.fillStyle = `rgba(255, 255, 255, ${amount})`;
        ctx.fillRect(px, py, 2, 2);
      } else if (rand < -0.6) {
        ctx.fillStyle = `rgba(0, 0, 0, ${amount})`;
        ctx.fillRect(px, py, 2, 2);
      }
    }
  }
}

/**
 * Generates an authentic 64x64 Minecraft skin canvas for each character.
 * Layout:
 * Head (0-32, 0-16): Top, Bottom, Right, Front, Left, Back
 * Torso (16-40, 16-32): Front, Back, Top, Bottom, Right, Left
 * Arms (40-56, 16-32): Right & Left arms
 * Legs (0-16, 16-32): Right & Left legs
 */
export function generateCharacterSkinTexture(characterId, isBlinking = false, mouthOpen = 0) {
  const { canvas, ctx } = createPixelCanvas(64, 64);

  // Background clear
  ctx.clearRect(0, 0, 64, 64);

  if (characterId === 'arjun') {
    // ARJUN: Technical Engineer
    // Dark hair, warm brown skin, navy shirt/jacket with sculk cyan #00E5C3 subtle detail
    const skin = '#a8734c';
    const hair = '#18191c';
    const jacket = '#1c2738';
    const shirt = '#334760';
    const cyanAccent = '#00E5C3';
    const eye = '#2b1e16';

    // 1. HEAD (Front: 8,8 to 16,16)
    addPixelVariation(ctx, 0, 0, 32, 16, skin, 0.05); // Skin base
    // Hair on head top and sides
    fillPixelRect(ctx, 8, 0, 8, 8, hair); // Top
    fillPixelRect(ctx, 0, 8, 8, 8, hair); // Right
    fillPixelRect(ctx, 16, 8, 8, 8, hair); // Left
    fillPixelRect(ctx, 24, 8, 8, 8, hair); // Back
    // Front Face (8,8)
    fillPixelRect(ctx, 8, 8, 8, 3, hair); // Forehead hair fringe
    fillPixelRect(ctx, 8, 10, 2, 2, hair); // Left hair side
    // Eyes
    if (isBlinking) {
      fillPixelRect(ctx, 9, 12, 2, 1, '#784c2f');
      fillPixelRect(ctx, 13, 12, 2, 1, '#784c2f');
    } else {
      fillPixelRect(ctx, 9, 12, 1, 2, '#ffffff'); // Sclera
      fillPixelRect(ctx, 10, 12, 1, 2, eye);      // Iris
      fillPixelRect(ctx, 13, 12, 1, 2, eye);      // Iris
      fillPixelRect(ctx, 14, 12, 1, 2, '#ffffff'); // Sclera
    }
    // Mouth
    if (mouthOpen > 0.1) {
      fillPixelRect(ctx, 10, 15, 4, 1, '#4a191f');
    } else {
      fillPixelRect(ctx, 10, 15, 4, 1, '#6b4129');
    }

    // 2. TORSO (20,20 to 28,32 is front)
    addPixelVariation(ctx, 16, 16, 24, 16, jacket, 0.06);
    // Inner collared shirt (front: 20,20 to 28,32)
    fillPixelRect(ctx, 23, 20, 2, 12, shirt);
    fillPixelRect(ctx, 22, 20, 4, 4, shirt);
    // Sculk cyan lapel / badge detail
    fillPixelRect(ctx, 21, 23, 1, 3, cyanAccent);
    // Belt / bottom trim
    fillPixelRect(ctx, 20, 30, 8, 2, '#0f1722');

    // 3. ARMS
    addPixelVariation(ctx, 40, 16, 16, 16, jacket, 0.05);
    // Hand skin
    fillPixelRect(ctx, 44, 28, 4, 4, skin);
    fillPixelRect(ctx, 52, 28, 4, 4, skin);

    // 4. LEGS
    addPixelVariation(ctx, 0, 16, 16, 16, '#171e28', 0.05); // Dark trousers
    fillPixelRect(ctx, 0, 28, 8, 4, '#0b0f14'); // Shoes
    fillPixelRect(ctx, 8, 28, 8, 4, '#0b0f14');

  } else if (characterId === 'maya') {
    // MAYA: Startup Interviewer
    // Indigo modern hair, warm olive skin, warm terracotta/amber hoodie #c2593f
    const skin = '#dfa882';
    const hair = '#22283a';
    const hoodie = '#b84d34';
    const hoodieDark = '#943822';
    const eye = '#4c2e59';

    // 1. HEAD
    addPixelVariation(ctx, 0, 0, 32, 16, skin, 0.05);
    fillPixelRect(ctx, 8, 0, 8, 8, hair); // Top
    fillPixelRect(ctx, 0, 8, 8, 8, hair); // Right
    fillPixelRect(ctx, 16, 8, 8, 8, hair); // Left
    fillPixelRect(ctx, 24, 8, 8, 8, hair); // Back
    // Modern side bangs on front
    fillPixelRect(ctx, 8, 8, 8, 3, hair);
    fillPixelRect(ctx, 8, 10, 3, 3, hair);
    fillPixelRect(ctx, 14, 10, 2, 2, hair);
    // Eyes
    if (isBlinking) {
      fillPixelRect(ctx, 9, 12, 2, 1, '#8f5c3d');
      fillPixelRect(ctx, 13, 12, 2, 1, '#8f5c3d');
    } else {
      fillPixelRect(ctx, 9, 12, 1, 2, '#ffffff');
      fillPixelRect(ctx, 10, 12, 1, 2, eye);
      fillPixelRect(ctx, 13, 12, 1, 2, eye);
      fillPixelRect(ctx, 14, 12, 1, 2, '#ffffff');
    }
    // Mouth
    if (mouthOpen > 0.1) {
      fillPixelRect(ctx, 10, 15, 4, 1, '#5c1b26');
    } else {
      fillPixelRect(ctx, 11, 15, 3, 1, '#944b58');
    }

    // 2. TORSO - Terracotta Hoodie
    addPixelVariation(ctx, 16, 16, 24, 16, hoodie, 0.06);
    // Hoodie pocket & strings
    fillPixelRect(ctx, 22, 26, 4, 4, hoodieDark);
    fillPixelRect(ctx, 22, 21, 1, 3, '#e5e7eb'); // String left
    fillPixelRect(ctx, 25, 21, 1, 3, '#e5e7eb'); // String right
    fillPixelRect(ctx, 23, 20, 2, 2, skin);     // Neck skin

    // 3. ARMS
    addPixelVariation(ctx, 40, 16, 16, 16, hoodie, 0.05);
    fillPixelRect(ctx, 44, 28, 4, 4, skin);
    fillPixelRect(ctx, 52, 28, 4, 4, skin);

    // 4. LEGS - Dark jeans
    addPixelVariation(ctx, 0, 16, 16, 16, '#283344', 0.05);
    fillPixelRect(ctx, 0, 28, 8, 4, '#ffffff'); // White sneakers
    fillPixelRect(ctx, 8, 28, 8, 4, '#ffffff');

  } else if (characterId === 'james') {
    // JAMES: Senior Engineering Manager
    // Silver-slate hair, formal charcoal suit #27272a, light shirt, crimson tie
    const skin = '#edd4c2';
    const hair = '#5e646e';
    const hairHighlight = '#8c94a0';
    const suit = '#22252a';
    const tie = '#881337';
    const eye = '#273c58';

    // 1. HEAD
    addPixelVariation(ctx, 0, 0, 32, 16, skin, 0.05);
    fillPixelRect(ctx, 8, 0, 8, 8, hair);
    fillPixelRect(ctx, 0, 8, 8, 8, hair);
    fillPixelRect(ctx, 16, 8, 8, 8, hair);
    fillPixelRect(ctx, 24, 8, 8, 8, hair);
    // Silver highlights
    fillPixelRect(ctx, 9, 1, 6, 2, hairHighlight);
    fillPixelRect(ctx, 8, 8, 8, 3, hair);
    fillPixelRect(ctx, 9, 9, 3, 1, hairHighlight);
    // Eyes
    if (isBlinking) {
      fillPixelRect(ctx, 9, 12, 2, 1, '#947563');
      fillPixelRect(ctx, 13, 12, 2, 1, '#947563');
    } else {
      fillPixelRect(ctx, 9, 12, 1, 2, '#ffffff');
      fillPixelRect(ctx, 10, 12, 1, 2, eye);
      fillPixelRect(ctx, 13, 12, 1, 2, eye);
      fillPixelRect(ctx, 14, 12, 1, 2, '#ffffff');
    }
    // Mouth
    if (mouthOpen > 0.1) {
      fillPixelRect(ctx, 10, 15, 4, 1, '#4a151b');
    } else {
      fillPixelRect(ctx, 10, 15, 4, 1, '#7a4e44');
    }

    // 2. TORSO - Formal Suit
    addPixelVariation(ctx, 16, 16, 24, 16, suit, 0.05);
    // White shirt V
    fillPixelRect(ctx, 22, 20, 4, 8, '#f1f5f9');
    // Crimson tie
    fillPixelRect(ctx, 23, 20, 2, 10, tie);
    fillPixelRect(ctx, 23, 30, 2, 1, tie);

    // 3. ARMS
    addPixelVariation(ctx, 40, 16, 16, 16, suit, 0.05);
    fillPixelRect(ctx, 44, 27, 4, 1, '#ffffff'); // Shirt cuff
    fillPixelRect(ctx, 52, 27, 4, 1, '#ffffff');
    fillPixelRect(ctx, 44, 28, 4, 4, skin);
    fillPixelRect(ctx, 52, 28, 4, 4, skin);

    // 4. LEGS - Charcoal trousers & dress shoes
    addPixelVariation(ctx, 0, 16, 16, 16, suit, 0.05);
    fillPixelRect(ctx, 0, 28, 8, 4, '#111317');
    fillPixelRect(ctx, 8, 28, 8, 4, '#111317');

  } else {
    // ALEXA: Friendly Recruiter
    // Auburn hair, peach skin, emerald green casual blazer #065f46, cream blouse
    const skin = '#f5cdb0';
    const hair = '#964b28';
    const blazer = '#065f46';
    const blouse = '#fef3c7';
    const eye = '#22543d';

    // 1. HEAD
    addPixelVariation(ctx, 0, 0, 32, 16, skin, 0.05);
    fillPixelRect(ctx, 8, 0, 8, 8, hair);
    fillPixelRect(ctx, 0, 8, 8, 8, hair);
    fillPixelRect(ctx, 16, 8, 8, 8, hair);
    fillPixelRect(ctx, 24, 8, 8, 8, hair);
    fillPixelRect(ctx, 8, 8, 8, 4, hair);
    fillPixelRect(ctx, 8, 10, 2, 4, hair);
    fillPixelRect(ctx, 14, 10, 2, 4, hair);
    // Eyes
    if (isBlinking) {
      fillPixelRect(ctx, 9, 12, 2, 1, '#996349');
      fillPixelRect(ctx, 13, 12, 2, 1, '#996349');
    } else {
      fillPixelRect(ctx, 9, 12, 1, 2, '#ffffff');
      fillPixelRect(ctx, 10, 12, 1, 2, eye);
      fillPixelRect(ctx, 13, 12, 1, 2, eye);
      fillPixelRect(ctx, 14, 12, 1, 2, '#ffffff');
    }
    // Gentle smile
    if (mouthOpen > 0.1) {
      fillPixelRect(ctx, 10, 15, 4, 1, '#5c1b26');
    } else {
      fillPixelRect(ctx, 10, 15, 4, 1, '#a34857');
    }

    // 2. TORSO - Emerald Blazer
    addPixelVariation(ctx, 16, 16, 24, 16, blazer, 0.06);
    // Cream blouse
    fillPixelRect(ctx, 22, 20, 4, 6, blouse);
    fillPixelRect(ctx, 23, 20, 2, 2, skin); // Neck

    // 3. ARMS
    addPixelVariation(ctx, 40, 16, 16, 16, blazer, 0.05);
    fillPixelRect(ctx, 44, 28, 4, 4, skin);
    fillPixelRect(ctx, 52, 28, 4, 4, skin);

    // 4. LEGS
    addPixelVariation(ctx, 0, 16, 16, 16, '#262626', 0.05);
    fillPixelRect(ctx, 0, 28, 8, 4, '#171717');
    fillPixelRect(ctx, 8, 28, 8, 4, '#171717');
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

/**
 * Creates authentic Minecraft block textures (stone, oak, grass, leaves, books)
 */
export function createBlockTexture(type = 'stone') {
  const { canvas, ctx } = createPixelCanvas(16, 16);

  if (type === 'stone') {
    addPixelVariation(ctx, 0, 0, 16, 16, '#6b7280', 0.12);
  } else if (type === 'oak_planks') {
    addPixelVariation(ctx, 0, 0, 16, 16, '#7c5333', 0.08);
    // Horizontal plank lines
    ctx.fillStyle = '#4a2f1b';
    ctx.fillRect(0, 4, 16, 1);
    ctx.fillRect(0, 8, 16, 1);
    ctx.fillRect(0, 12, 16, 1);
  } else if (type === 'dark_oak') {
    addPixelVariation(ctx, 0, 0, 16, 16, '#382315', 0.08);
    ctx.fillStyle = '#22140b';
    ctx.fillRect(0, 4, 16, 1);
    ctx.fillRect(0, 8, 16, 1);
    ctx.fillRect(0, 12, 16, 1);
  } else if (type === 'grass_top') {
    addPixelVariation(ctx, 0, 0, 16, 16, '#4d7c0f', 0.14);
  } else if (type === 'grass_side') {
    // Dirt base
    addPixelVariation(ctx, 0, 4, 16, 12, '#5e3a20', 0.1);
    // Grass overhang
    addPixelVariation(ctx, 0, 0, 16, 4, '#4d7c0f', 0.12);
    ctx.fillStyle = '#4d7c0f';
    ctx.fillRect(2, 4, 2, 2);
    ctx.fillRect(7, 4, 3, 3);
    ctx.fillRect(13, 4, 2, 2);
  } else if (type === 'pine_leaves') {
    addPixelVariation(ctx, 0, 0, 16, 16, '#285e34', 0.15);
  } else if (type === 'bookshelf') {
    addPixelVariation(ctx, 0, 0, 16, 16, '#5e3a20', 0.05);
    ctx.fillStyle = '#26160c';
    ctx.fillRect(1, 1, 14, 6);
    ctx.fillRect(1, 9, 14, 6);
    // Books
    const bColors = ['#991b1b', '#1e40af', '#065f46', '#854d0e', '#581c87'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = bColors[i % bColors.length];
      ctx.fillRect(2 + i * 3, 2, 2, 5);
      ctx.fillStyle = bColors[(i + 2) % bColors.length];
      ctx.fillRect(2 + i * 3, 10, 2, 5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}
