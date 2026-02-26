// =====================================================
// INGREDIENT AGGREGATOR — Normalization, Conversion, Dedup
// =====================================================

// --- 1. SYNONYM MAP (lowercased key → canonical name) ---
const SYNONYMS = {
  'tomato': 'Tomatoes', 'tomatoes': 'Tomatoes',
  'onion': 'Onions', 'onions': 'Onions',
  'garlic clove': 'Garlic', 'garlic cloves': 'Garlic', 'clove garlic': 'Garlic', 'cloves garlic': 'Garlic', 'garlic': 'Garlic',
  'egg': 'Eggs', 'eggs': 'Eggs', 'large egg': 'Eggs', 'large eggs': 'Eggs',
  'banana': 'Bananas', 'bananas': 'Bananas',
  'apple': 'Apples', 'apples': 'Apples',
  'lemon': 'Lemons', 'lemons': 'Lemons',
  'lime': 'Limes', 'limes': 'Limes',
  'avocado': 'Avocados', 'avocados': 'Avocados',
  'bell pepper': 'Bell Peppers', 'bell peppers': 'Bell Peppers',
  'carrot': 'Carrots', 'carrots': 'Carrots',
  'potato': 'Potatoes', 'potatoes': 'Potatoes',
  'sweet potato': 'Sweet Potatoes', 'sweet potatoes': 'Sweet Potatoes',
  'chicken breast': 'Chicken Breast', 'boneless chicken breast': 'Chicken Breast', 'chicken breasts': 'Chicken Breast',
  'salmon fillet': 'Salmon Fillet', 'salmon fillets': 'Salmon Fillet',
  'ground beef': 'Ground Beef',
  'olive oil': 'Olive Oil',
  'brown rice': 'Brown Rice',
  'white rice': 'White Rice', 'rice': 'White Rice',
  'whole wheat bread': 'Whole Wheat Bread',
  'greek yogurt': 'Greek Yogurt',
  'mixed berries': 'Mixed Berries',
  'rolled oats': 'Rolled Oats', 'oats': 'Rolled Oats',
  'almond milk': 'Almond Milk',
  'soy sauce': 'Soy Sauce',
  'vegetable broth': 'Vegetable Broth',
  'spinach': 'Spinach',
  'romaine lettuce': 'Romaine Lettuce', 'lettuce': 'Romaine Lettuce',
  'cherry tomatoes': 'Cherry Tomatoes',
  'cucumber': 'Cucumber', 'cucumbers': 'Cucumber',
  'broccoli': 'Broccoli',
  'asparagus': 'Asparagus',
  'cilantro': 'Cilantro',
  'parmesan cheese': 'Parmesan Cheese', 'parmesan': 'Parmesan Cheese',
  'cheddar cheese': 'Cheddar Cheese', 'cheddar': 'Cheddar Cheese',
  'butter': 'Butter',
  'milk': 'Milk',
  'honey': 'Honey',
  'quinoa': 'Quinoa',
  'chickpeas': 'Chickpeas', 'chickpea': 'Chickpeas',
  'red lentils': 'Red Lentils', 'lentils': 'Red Lentils',
  'corn tortillas': 'Corn Tortillas',
  'whole wheat tortilla': 'Whole Wheat Tortillas', 'whole wheat tortillas': 'Whole Wheat Tortillas',
  'sour cream': 'Sour Cream',
  'hummus': 'Hummus',
  'sesame oil': 'Sesame Oil',
  'protein powder': 'Protein Powder',
  'granola': 'Granola',
  'pasta': 'Pasta',
  'marinara sauce': 'Marinara Sauce',
  'kale': 'Kale',
  'mixed greens': 'Mixed Greens',
  'celery': 'Celery',
  'rosemary': 'Rosemary',
  'cumin': 'Cumin',
  'firm tofu': 'Firm Tofu', 'tofu': 'Firm Tofu',
  'turkey breast': 'Turkey Breast',
  'turkey slices': 'Turkey Slices',
  'pork tenderloin': 'Pork Tenderloin',
  'shrimp': 'Shrimp',
  'ribeye steak': 'Ribeye Steak', 'steak': 'Ribeye Steak',
};

// --- 2. QUALIFIERS TO STRIP ---
const STRIP_QUALIFIERS = [
  'large', 'medium', 'small', 'extra', 'fresh', 'organic', 'chopped', 'diced',
  'minced', 'sliced', 'frozen', 'dried', 'canned', 'raw', 'cooked',
  'whole', 'ripe', 'baby', 'dry', 'packed',
];

// --- 3. UNIT CONVERSION TABLES ---
const VOLUME_TO_ML = {
  'ml': 1, 'milliliter': 1, 'milliliters': 1,
  'tsp': 5, 'teaspoon': 5, 'teaspoons': 5,
  'tbsp': 15, 'tablespoon': 15, 'tablespoons': 15,
  'fl oz': 30, 'fluid ounce': 30, 'fluid ounces': 30,
  'cup': 240, 'cups': 240,
  'pint': 480, 'pints': 480,
  'quart': 960, 'quarts': 960,
  'liter': 1000, 'liters': 1000, 'l': 1000,
  'gallon': 3785, 'gallons': 3785,
};

const WEIGHT_TO_G = {
  'g': 1, 'gram': 1, 'grams': 1,
  'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35,
  'lb': 453.59, 'lbs': 453.59, 'pound': 453.59, 'pounds': 453.59,
  'kg': 1000, 'kilogram': 1000, 'kilograms': 1000,
};

const COUNT_UNITS = new Set([
  'each', 'whole', 'piece', 'pieces', 'clove', 'cloves',
  'sprig', 'sprigs', 'stalk', 'stalks', 'head', 'heads',
  'slice', 'slices', 'leaf', 'leaves', 'bunch', 'bunches',
  'can', 'cans', 'jar', 'jars', 'pack', 'packs', 'bag', 'bags',
  'block', 'blocks', 'scoop', 'scoops', 'serving', 'servings',
  'loaf', 'loaves', 'unit',
]);

// --- 4. PARSING HELPERS ---

function parseQuantityString(qtyStr) {
  if (!qtyStr || typeof qtyStr !== 'string') return { qty: 1, unit: 'each' };

  const s = qtyStr.trim().toLowerCase();

  // Match patterns like "2 cups", "1/2 cup", "1.5 lbs", "3 large", "14 oz block"
  const match = s.match(/^([\d./]+)\s*(.*)$/);
  if (!match) {
    // No leading number — might be "a bunch" or just unit
    const unitOnly = s.replace(/^(a|an)\s+/, '');
    return { qty: 1, unit: unitOnly || 'each' };
  }

  let numStr = match[1];
  let rest = match[2].trim();

  // Parse number (handle fractions like 1/2, 1/4)
  let qty;
  if (numStr.includes('/')) {
    const parts = numStr.split('/');
    qty = parseFloat(parts[0]) / parseFloat(parts[1]);
  } else {
    qty = parseFloat(numStr);
  }
  if (isNaN(qty) || qty <= 0) qty = 1;

  // Strip qualifiers from unit string
  let unitParts = rest.split(/\s+/).filter(w => !STRIP_QUALIFIERS.includes(w));
  let unit = unitParts.join(' ') || 'each';

  return { qty, unit };
}

function normalizeIngredientName(rawName) {
  if (!rawName) return 'Unknown Item';

  let name = rawName.trim().toLowerCase();

  // Remove leading quantity-like patterns that leaked into the name
  name = name.replace(/^\d[\d./]*\s*(oz|lb|lbs|g|kg|cup|cups|tbsp|tsp|ml|each|whole|medium|large|small|can|jar|bunch|head|stalk|stalks|sprig|sprigs|clove|cloves|block|scoop|pack|bag|slice|slices|piece|pieces|serving|servings|loaf|pound|pounds|ounce|ounces|gram|grams)?\s*/i, '');

  // Strip qualifiers
  const words = name.split(/\s+/);
  const cleaned = words.filter(w => !STRIP_QUALIFIERS.includes(w)).join(' ');
  name = cleaned || name; // fallback if all words were qualifiers

  // Check synonym map (try progressively shorter phrases)
  const nameWords = name.split(/\s+/);
  for (let len = nameWords.length; len >= 1; len--) {
    const phrase = nameWords.slice(0, len).join(' ');
    if (SYNONYMS[phrase]) return SYNONYMS[phrase];
  }
  // Also try full name
  if (SYNONYMS[name]) return SYNONYMS[name];

  // Title case fallback
  return name.replace(/\b\w/g, c => c.toUpperCase());
}

function getUnitType(unit) {
  const u = unit.toLowerCase().trim();
  if (VOLUME_TO_ML[u]) return 'volume';
  if (WEIGHT_TO_G[u]) return 'weight';
  if (COUNT_UNITS.has(u)) return 'count';
  return 'unknown';
}

function convertToBase(qty, unit) {
  const u = unit.toLowerCase().trim();
  if (VOLUME_TO_ML[u]) return { value: qty * VOLUME_TO_ML[u], baseUnit: 'ml', type: 'volume' };
  if (WEIGHT_TO_G[u]) return { value: qty * WEIGHT_TO_G[u], baseUnit: 'g', type: 'weight' };
  return { value: qty, baseUnit: unit, type: 'count' };
}

function formatFromBase(value, type) {
  if (type === 'volume') {
    if (value >= 240) return { qty: Math.round(value / 240 * 10) / 10, unit: 'cups' };
    if (value >= 15) return { qty: Math.round(value / 15 * 10) / 10, unit: 'tbsp' };
    return { qty: Math.round(value / 5 * 10) / 10, unit: 'tsp' };
  }
  if (type === 'weight') {
    if (value >= 453.59) return { qty: Math.round(value / 453.59 * 10) / 10, unit: 'lbs' };
    if (value >= 28.35) return { qty: Math.round(value / 28.35 * 10) / 10, unit: 'oz' };
    return { qty: Math.round(value), unit: 'g' };
  }
  return { qty: Math.round(value * 10) / 10, unit: 'each' };
}

function formatQtyDisplay(qty, unit) {
  // Friendly fraction display
  const u = unit || 'each';
  const rounded = Math.round(qty * 4) / 4; // round to nearest quarter

  const whole = Math.floor(rounded);
  const frac = rounded - whole;
  const fractionMap = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

  let numStr;
  if (frac === 0) {
    numStr = String(whole || 1);
  } else if (whole === 0) {
    numStr = fractionMap[frac] || String(rounded);
  } else {
    numStr = `${whole}${fractionMap[frac] || ''}`;
  }

  return `${numStr} ${u}`;
}

// --- 5. CATEGORY ASSIGNMENT ---
const CATEGORY_KEYWORDS = {
  Protein: ['chicken', 'beef', 'turkey', 'pork', 'steak', 'shrimp', 'salmon', 'tofu', 'eggs', 'lentil', 'chickpea', 'protein powder'],
  Dairy: ['milk', 'yogurt', 'cheese', 'butter', 'sour cream', 'cream'],
  Produce: ['tomato', 'onion', 'garlic', 'pepper', 'lettuce', 'spinach', 'kale', 'broccoli', 'asparagus', 'carrot', 'celery', 'cucumber', 'avocado', 'banana', 'apple', 'lemon', 'lime', 'berries', 'potato', 'cilantro', 'rosemary', 'mixed greens'],
  Grains: ['rice', 'pasta', 'bread', 'tortilla', 'oats', 'quinoa', 'granola'],
  Pantry: ['oil', 'sauce', 'honey', 'broth', 'cumin', 'hummus', 'soy sauce', 'sesame', 'marinara'],
  Frozen: ['frozen'],
  Beverages: ['almond milk', 'juice'],
};

function assignCategory(name) {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return cat;
    }
  }
  return 'Other';
}

// --- 6. PRICE ESTIMATES (Atlanta-area 2025/2026) ---
const PRICE_PER_UNIT = {
  // per standard unit (e.g., per lb for weight, per cup for volume, per each for count)
  'Chicken Breast': { per: 'lb', price: 4.29 },
  'Ground Beef': { per: 'lb', price: 5.49 },
  'Salmon Fillet': { per: 'lb', price: 9.99 },
  'Ribeye Steak': { per: 'lb', price: 14.99 },
  'Pork Tenderloin': { per: 'lb', price: 4.99 },
  'Turkey Breast': { per: 'lb', price: 5.49 },
  'Shrimp': { per: 'lb', price: 8.99 },
  'Eggs': { per: 'each', price: 0.35 },
  'Milk': { per: 'cup', price: 0.65 },
  'Greek Yogurt': { per: 'cup', price: 1.49 },
  'Butter': { per: 'tbsp', price: 0.25 },
  'Cheddar Cheese': { per: 'oz', price: 0.50 },
  'Parmesan Cheese': { per: 'oz', price: 0.75 },
  'Sour Cream': { per: 'cup', price: 2.49 },
  'Bananas': { per: 'each', price: 0.29 },
  'Apples': { per: 'each', price: 1.09 },
  'Lemons': { per: 'each', price: 0.69 },
  'Limes': { per: 'each', price: 0.49 },
  'Avocados': { per: 'each', price: 1.29 },
  'Tomatoes': { per: 'each', price: 0.89 },
  'Onions': { per: 'each', price: 0.79 },
  'Bell Peppers': { per: 'each', price: 1.19 },
  'Carrots': { per: 'each', price: 0.45 },
  'Broccoli': { per: 'head', price: 2.49 },
  'Asparagus': { per: 'bunch', price: 3.49 },
  'Spinach': { per: 'bag', price: 2.99 },
  'Romaine Lettuce': { per: 'head', price: 2.29 },
  'Cucumber': { per: 'each', price: 0.89 },
  'Cherry Tomatoes': { per: 'cup', price: 2.99 },
  'Cilantro': { per: 'bunch', price: 0.99 },
  'Rosemary': { per: 'sprig', price: 0.50 },
  'Celery': { per: 'stalk', price: 0.40 },
  'Kale': { per: 'bunch', price: 2.79 },
  'Mixed Greens': { per: 'cup', price: 1.25 },
  'Sweet Potatoes': { per: 'each', price: 1.29 },
  'Garlic': { per: 'each', price: 0.25 },
  'Brown Rice': { per: 'cup', price: 0.89 },
  'White Rice': { per: 'cup', price: 0.65 },
  'Pasta': { per: 'oz', price: 0.19 },
  'Whole Wheat Bread': { per: 'loaf', price: 3.49 },
  'Rolled Oats': { per: 'cup', price: 0.55 },
  'Quinoa': { per: 'cup', price: 1.99 },
  'Corn Tortillas': { per: 'pack', price: 2.99 },
  'Whole Wheat Tortillas': { per: 'each', price: 0.50 },
  'Granola': { per: 'cup', price: 1.49 },
  'Olive Oil': { per: 'tbsp', price: 0.30 },
  'Sesame Oil': { per: 'tbsp', price: 0.45 },
  'Soy Sauce': { per: 'tbsp', price: 0.15 },
  'Honey': { per: 'tbsp', price: 0.50 },
  'Vegetable Broth': { per: 'cup', price: 0.60 },
  'Marinara Sauce': { per: 'jar', price: 3.49 },
  'Hummus': { per: 'tbsp', price: 0.30 },
  'Cumin': { per: 'tsp', price: 0.15 },
  'Protein Powder': { per: 'scoop', price: 1.50 },
  'Almond Milk': { per: 'cup', price: 0.65 },
  'Mixed Berries': { per: 'cup', price: 3.49 },
  'Chickpeas': { per: 'can', price: 1.29 },
  'Red Lentils': { per: 'cup', price: 1.49 },
  'Firm Tofu': { per: 'block', price: 2.49 },
  'Turkey Slices': { per: 'oz', price: 0.65 },
};

const CATEGORY_FALLBACK_PRICES = {
  Produce: 2.49, Protein: 5.99, Dairy: 3.49, Grains: 2.99,
  Pantry: 2.99, Frozen: 4.99, Beverages: 2.99, Other: 3.49,
};

function estimatePrice(canonicalName, qty, unit, category) {
  const priceInfo = PRICE_PER_UNIT[canonicalName];
  if (priceInfo) {
    // Attempt to convert qty to match price unit
    return Math.round(qty * priceInfo.price * 100) / 100;
  }
  // Fallback: category-based
  const base = CATEGORY_FALLBACK_PRICES[category] || 3.49;
  // Scale slightly by quantity
  const scale = Math.max(1, qty / 2);
  return Math.round(base * scale * 100) / 100;
}

// --- 7. MEAL → INGREDIENTS MAP (comprehensive) ---
const MEAL_INGREDIENT_MAP = {
  chicken: [
    ['Chicken Breast', 'Protein', '1 lb'],
    ['Olive Oil', 'Pantry', '2 tbsp'],
    ['Garlic', 'Produce', '3 cloves'],
    ['Onions', 'Produce', '1 each'],
    ['Salt', 'Pantry', '1 tsp'],
  ],
  salmon: [
    ['Salmon Fillet', 'Protein', '6 oz'],
    ['Lemons', 'Produce', '1 each'],
    ['Asparagus', 'Produce', '1 bunch'],
    ['Olive Oil', 'Pantry', '1 tbsp'],
    ['Garlic', 'Produce', '2 cloves'],
  ],
  beef: [
    ['Ground Beef', 'Protein', '1 lb'],
    ['Onions', 'Produce', '1 each'],
    ['Garlic', 'Produce', '4 cloves'],
    ['Tomatoes', 'Produce', '2 each'],
  ],
  steak: [
    ['Ribeye Steak', 'Protein', '12 oz'],
    ['Butter', 'Dairy', '2 tbsp'],
    ['Rosemary', 'Produce', '2 sprigs'],
    ['Garlic', 'Produce', '3 cloves'],
  ],
  stir: [
    ['Soy Sauce', 'Pantry', '3 tbsp'],
    ['Bell Peppers', 'Produce', '2 each'],
    ['Broccoli', 'Produce', '1 head'],
    ['Sesame Oil', 'Pantry', '1 tbsp'],
    ['Garlic', 'Produce', '2 cloves'],
    ['Brown Rice', 'Grains', '1 cup'],
  ],
  salad: [
    ['Romaine Lettuce', 'Produce', '1 head'],
    ['Cherry Tomatoes', 'Produce', '1 cup'],
    ['Cucumber', 'Produce', '1 each'],
    ['Olive Oil', 'Pantry', '2 tbsp'],
    ['Lemons', 'Produce', '1 each'],
  ],
  pasta: [
    ['Pasta', 'Grains', '8 oz'],
    ['Marinara Sauce', 'Pantry', '1 jar'],
    ['Parmesan Cheese', 'Dairy', '2 oz'],
    ['Garlic', 'Produce', '3 cloves'],
    ['Olive Oil', 'Pantry', '1 tbsp'],
  ],
  taco: [
    ['Corn Tortillas', 'Grains', '1 pack'],
    ['Limes', 'Produce', '2 each'],
    ['Cilantro', 'Produce', '1 bunch'],
    ['Sour Cream', 'Dairy', '0.25 cup'],
    ['Avocados', 'Produce', '1 each'],
    ['Onions', 'Produce', '1 each'],
  ],
  shrimp: [
    ['Shrimp', 'Protein', '8 oz'],
    ['Butter', 'Dairy', '2 tbsp'],
    ['Garlic', 'Produce', '3 cloves'],
    ['Lemons', 'Produce', '1 each'],
  ],
  oatmeal: [
    ['Rolled Oats', 'Grains', '1 cup'],
    ['Bananas', 'Produce', '1 each'],
    ['Honey', 'Pantry', '1 tbsp'],
    ['Milk', 'Dairy', '0.5 cup'],
  ],
  yogurt: [
    ['Greek Yogurt', 'Dairy', '1 cup'],
    ['Mixed Berries', 'Produce', '0.5 cup'],
    ['Honey', 'Pantry', '1 tsp'],
    ['Granola', 'Pantry', '0.25 cup'],
  ],
  quinoa: [
    ['Quinoa', 'Grains', '1 cup'],
    ['Vegetable Broth', 'Pantry', '2 cups'],
    ['Chickpeas', 'Protein', '1 can'],
    ['Spinach', 'Produce', '2 cups'],
    ['Lemons', 'Produce', '1 each'],
  ],
  smoothie: [
    ['Bananas', 'Produce', '1 each'],
    ['Mixed Berries', 'Produce', '1 cup'],
    ['Almond Milk', 'Beverages', '1 cup'],
    ['Protein Powder', 'Pantry', '1 scoop'],
  ],
  avocado: [
    ['Avocados', 'Produce', '1 each'],
    ['Whole Wheat Bread', 'Grains', '1 loaf'],
    ['Eggs', 'Protein', '2 each'],
    ['Lemons', 'Produce', '0.5 each'],
  ],
  soup: [
    ['Vegetable Broth', 'Pantry', '4 cups'],
    ['Carrots', 'Produce', '2 each'],
    ['Celery', 'Produce', '2 stalks'],
    ['Onions', 'Produce', '1 each'],
    ['Garlic', 'Produce', '3 cloves'],
  ],
  wrap: [
    ['Whole Wheat Tortillas', 'Grains', '2 each'],
    ['Turkey Slices', 'Protein', '4 oz'],
    ['Romaine Lettuce', 'Produce', '2 leaves'],
    ['Hummus', 'Pantry', '2 tbsp'],
  ],
  rice: [
    ['Brown Rice', 'Grains', '1 cup'],
    ['Soy Sauce', 'Pantry', '2 tbsp'],
  ],
  bowl: [
    ['Mixed Greens', 'Produce', '2 cups'],
    ['Brown Rice', 'Grains', '0.5 cup'],
    ['Olive Oil', 'Pantry', '1 tbsp'],
    ['Avocados', 'Produce', '0.5 each'],
    ['Cherry Tomatoes', 'Produce', '0.5 cup'],
  ],
  egg: [
    ['Eggs', 'Protein', '3 each'],
    ['Olive Oil', 'Pantry', '1 tsp'],
    ['Bell Peppers', 'Produce', '0.5 each'],
    ['Onions', 'Produce', '0.5 each'],
  ],
  lentil: [
    ['Red Lentils', 'Protein', '1 cup'],
    ['Vegetable Broth', 'Pantry', '3 cups'],
    ['Cumin', 'Pantry', '1 tsp'],
    ['Onions', 'Produce', '1 each'],
    ['Garlic', 'Produce', '3 cloves'],
  ],
  pork: [
    ['Pork Tenderloin', 'Protein', '1 lb'],
    ['Garlic', 'Produce', '3 cloves'],
    ['Rosemary', 'Produce', '1 sprig'],
    ['Olive Oil', 'Pantry', '1 tbsp'],
  ],
  turkey: [
    ['Turkey Breast', 'Protein', '1 lb'],
    ['Onions', 'Produce', '1 each'],
    ['Celery', 'Produce', '2 stalks'],
    ['Garlic', 'Produce', '2 cloves'],
  ],
  tofu: [
    ['Firm Tofu', 'Protein', '1 block'],
    ['Soy Sauce', 'Pantry', '2 tbsp'],
    ['Sesame Oil', 'Pantry', '1 tbsp'],
    ['Broccoli', 'Produce', '1 head'],
  ],
  berry: [
    ['Mixed Berries', 'Produce', '1 cup'],
    ['Greek Yogurt', 'Dairy', '0.5 cup'],
  ],
  banana: [
    ['Bananas', 'Produce', '2 each'],
  ],
  apple: [
    ['Apples', 'Produce', '2 each'],
  ],
  oat: [
    ['Rolled Oats', 'Grains', '1 cup'],
    ['Milk', 'Dairy', '0.5 cup'],
  ],
  bread: [
    ['Whole Wheat Bread', 'Grains', '1 loaf'],
  ],
  cheese: [
    ['Cheddar Cheese', 'Dairy', '8 oz'],
  ],
  tomato: [
    ['Tomatoes', 'Produce', '2 each'],
  ],
  spinach: [
    ['Spinach', 'Produce', '1 bag'],
  ],
  kale: [
    ['Kale', 'Produce', '1 bunch'],
  ],
  sweet: [
    ['Sweet Potatoes', 'Produce', '2 each'],
  ],
  broccoli: [
    ['Broccoli', 'Produce', '1 head'],
  ],
  pepper: [
    ['Bell Peppers', 'Produce', '2 each'],
  ],
  mediterranean: [
    ['Olive Oil', 'Pantry', '2 tbsp'],
    ['Tomatoes', 'Produce', '2 each'],
    ['Cucumber', 'Produce', '1 each'],
    ['Garlic', 'Produce', '2 cloves'],
    ['Lemons', 'Produce', '1 each'],
  ],
  curry: [
    ['Onions', 'Produce', '1 each'],
    ['Garlic', 'Produce', '3 cloves'],
    ['Cumin', 'Pantry', '1 tsp'],
    ['Coconut Milk', 'Pantry', '1 can'],
    ['Brown Rice', 'Grains', '1 cup'],
  ],
  sandwich: [
    ['Whole Wheat Bread', 'Grains', '1 loaf'],
    ['Romaine Lettuce', 'Produce', '2 leaves'],
    ['Tomatoes', 'Produce', '1 each'],
  ],
  pancake: [
    ['Eggs', 'Protein', '2 each'],
    ['Milk', 'Dairy', '1 cup'],
    ['Whole Wheat Bread', 'Grains', '1 loaf'],
    ['Bananas', 'Produce', '1 each'],
    ['Honey', 'Pantry', '2 tbsp'],
  ],
  fish: [
    ['Salmon Fillet', 'Protein', '6 oz'],
    ['Lemons', 'Produce', '1 each'],
    ['Olive Oil', 'Pantry', '1 tbsp'],
  ],
  veggie: [
    ['Bell Peppers', 'Produce', '1 each'],
    ['Broccoli', 'Produce', '1 head'],
    ['Carrots', 'Produce', '2 each'],
    ['Olive Oil', 'Pantry', '1 tbsp'],
  ],
  fruit: [
    ['Bananas', 'Produce', '2 each'],
    ['Apples', 'Produce', '1 each'],
    ['Mixed Berries', 'Produce', '1 cup'],
  ],
  granola: [
    ['Granola', 'Pantry', '1 cup'],
    ['Greek Yogurt', 'Dairy', '1 cup'],
    ['Honey', 'Pantry', '1 tbsp'],
  ],
  hummus: [
    ['Hummus', 'Pantry', '4 tbsp'],
    ['Carrots', 'Produce', '2 each'],
    ['Cucumber', 'Produce', '1 each'],
  ],
  burrito: [
    ['Whole Wheat Tortillas', 'Grains', '2 each'],
    ['Brown Rice', 'Grains', '0.5 cup'],
    ['Chickpeas', 'Protein', '1 can'],
    ['Avocados', 'Produce', '1 each'],
    ['Sour Cream', 'Dairy', '2 tbsp'],
  ],
};

// --- 8. MAIN AGGREGATION FUNCTION ---

export function extractIngredientsFromMealName(mealName) {
  const lower = mealName.toLowerCase();
  const ingredients = new Map();
  let matched = false;

  for (const [keyword, items] of Object.entries(MEAL_INGREDIENT_MAP)) {
    if (lower.includes(keyword)) {
      matched = true;
      for (const [name, category, quantity] of items) {
        const canonical = normalizeIngredientName(name);
        if (!ingredients.has(canonical)) {
          ingredients.set(canonical, { name: canonical, category, quantityStr: quantity });
        }
      }
    }
  }

  if (!matched) {
    // Generic fallback: create a single item
    const canonical = normalizeIngredientName(mealName);
    ingredients.set(canonical, { name: canonical, category: assignCategory(mealName), quantityStr: '1 serving' });
  }

  return Array.from(ingredients.values());
}

export function aggregateIngredients(mealPlan) {
  if (!mealPlan?.meals?.length) return [];

  // Phase 1: Extract all raw ingredients from every meal
  const rawIngredients = [];

  for (const day of mealPlan.meals) {
    const mealSlots = ['breakfast', 'lunch', 'dinner'];
    for (const slot of mealSlots) {
      const meal = day[slot];
      if (meal?.name) {
        const ingredients = extractIngredientsFromMealName(meal.name);
        for (const ing of ingredients) {
          rawIngredients.push({ ...ing, sourceMeal: meal.name });
        }
      }
    }
    // Snacks
    if (day.snacks?.length) {
      for (const snack of day.snacks) {
        if (snack?.name) {
          const ingredients = extractIngredientsFromMealName(snack.name);
          for (const ing of ingredients) {
            rawIngredients.push({ ...ing, sourceMeal: snack.name });
          }
        }
      }
    }
    // Dessert
    if (day.dessert?.name) {
      const ingredients = extractIngredientsFromMealName(day.dessert.name);
      for (const ing of ingredients) {
        rawIngredients.push({ ...ing, sourceMeal: day.dessert.name });
      }
    }
  }

  // Phase 2: Group by canonical name, then by unit type
  // key = canonical name, value = { entries: [{qty, unit, unitType, baseMl/baseG}] }
  const grouped = new Map();

  for (const raw of rawIngredients) {
    const { qty, unit } = parseQuantityString(raw.quantityStr);
    const key = raw.name; // already canonical
    if (!grouped.has(key)) {
      grouped.set(key, {
        name: raw.name,
        category: raw.category,
        sourceMeals: new Set(),
        entries: [],
      });
    }
    const group = grouped.get(key);
    group.sourceMeals.add(raw.sourceMeal);
    group.entries.push({ qty, unit });
  }

  // Phase 3: Sum quantities with unit conversion
  const results = [];

  for (const [, group] of grouped) {
    // Separate entries by unit type
    const byType = { volume: [], weight: [], count: [], unknown: [] };

    for (const entry of group.entries) {
      const type = getUnitType(entry.unit);
      if (type === 'volume') {
        const base = convertToBase(entry.qty, entry.unit);
        byType.volume.push(base.value);
      } else if (type === 'weight') {
        const base = convertToBase(entry.qty, entry.unit);
        byType.weight.push(base.value);
      } else if (type === 'count') {
        // Group count by unit
        if (!byType.countMap) byType.countMap = {};
        const u = entry.unit.toLowerCase();
        byType.countMap[u] = (byType.countMap[u] || 0) + entry.qty;
        byType.count.push({ qty: entry.qty, unit: entry.unit });
      } else {
        // Unknown unit — group by exact unit string
        if (!byType.unknownMap) byType.unknownMap = {};
        const u = entry.unit.toLowerCase();
        byType.unknownMap[u] = (byType.unknownMap[u] || 0) + entry.qty;
      }
    }

    const subEntries = [];

    // Sum volumes
    if (byType.volume.length > 0) {
      const totalMl = byType.volume.reduce((s, v) => s + v, 0);
      const fmt = formatFromBase(totalMl, 'volume');
      subEntries.push({ qty: fmt.qty, unit: fmt.unit });
    }

    // Sum weights
    if (byType.weight.length > 0) {
      const totalG = byType.weight.reduce((s, v) => s + v, 0);
      const fmt = formatFromBase(totalG, 'weight');
      subEntries.push({ qty: fmt.qty, unit: fmt.unit });
    }

    // Sum count units
    if (byType.countMap) {
      for (const [unit, total] of Object.entries(byType.countMap)) {
        subEntries.push({ qty: total, unit });
      }
    }

    // Sum unknown units
    if (byType.unknownMap) {
      for (const [unit, total] of Object.entries(byType.unknownMap)) {
        subEntries.push({ qty: total, unit });
      }
    }

    // Build display string
    if (subEntries.length === 0) {
      subEntries.push({ qty: 1, unit: 'each' });
    }

    // Primary entry = largest subentry
    const primary = subEntries[0];
    const displayParts = subEntries.map(e => formatQtyDisplay(e.qty, e.unit));
    const displayStr = displayParts.join(' + ');

    const price = estimatePrice(group.name, primary.qty, primary.unit, group.category);

    results.push({
      name: group.name,
      category: group.category || assignCategory(group.name),
      quantity: displayStr,
      estimated_price: Math.min(Math.max(0.49, price), 35),
      source_meal: Array.from(group.sourceMeals).slice(0, 3).join(', '),
      is_purchased: false,
    });
  }

  // Sort alphabetically by category then name
  results.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  return results;
}