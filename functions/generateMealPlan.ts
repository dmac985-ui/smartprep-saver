import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const DIET_RULES = {
  Keto: "High fat, <20g net carbs/day, no sugar/grains",
  Vegan: "Plant-based only, no animal products",
  Paleo: "No grains, dairy, legumes, processed foods",
  Mediterranean: "Emphasis on olive oil, fish, whole grains, fruits, vegetables",
  "Low-Carb": "Under 100g carbs/day, focus on protein and healthy fats",
  "High-Protein": "At least 30% calories from protein, lean meats and legumes",
  Vegetarian: "No meat or fish, dairy and eggs allowed",
  Balanced: "Standard balanced macros, variety of whole foods",
  Standard: "Standard balanced macros, variety of whole foods",
};

const MEAL_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    calories: { type: "number" },
    protein: { type: "number" },
    carbs: { type: "number" },
    fats: { type: "number" },
    prep_time: { type: "string" }
  },
  required: ["name", "calories", "protein", "carbs", "fats", "prep_time"]
};

const FALLBACK_PLAN = [
  { day: "Monday", breakfast: { name: "Oatmeal with Berries", calories: 350, protein: 12, carbs: 55, fats: 8, prep_time: "10 min" }, lunch: { name: "Grilled Chicken Salad", calories: 450, protein: 35, carbs: 20, fats: 22, prep_time: "15 min" }, dinner: { name: "Baked Salmon with Vegetables", calories: 550, protein: 40, carbs: 25, fats: 28, prep_time: "30 min" }, snacks: [{ name: "Greek Yogurt", calories: 150, protein: 15, carbs: 12, fats: 4, prep_time: "2 min" }, { name: "Apple with Almond Butter", calories: 200, protein: 5, carbs: 25, fats: 10, prep_time: "2 min" }] },
  { day: "Tuesday", breakfast: { name: "Scrambled Eggs with Toast", calories: 400, protein: 22, carbs: 30, fats: 20, prep_time: "10 min" }, lunch: { name: "Turkey Wrap", calories: 420, protein: 28, carbs: 35, fats: 18, prep_time: "10 min" }, dinner: { name: "Chicken Stir-Fry with Rice", calories: 520, protein: 35, carbs: 50, fats: 16, prep_time: "25 min" }, snacks: [{ name: "Mixed Nuts", calories: 180, protein: 6, carbs: 8, fats: 16, prep_time: "1 min" }, { name: "Banana", calories: 105, protein: 1, carbs: 27, fats: 0, prep_time: "1 min" }] },
  { day: "Wednesday", breakfast: { name: "Smoothie Bowl", calories: 380, protein: 15, carbs: 50, fats: 12, prep_time: "10 min" }, lunch: { name: "Lentil Soup with Bread", calories: 440, protein: 20, carbs: 55, fats: 12, prep_time: "20 min" }, dinner: { name: "Grilled Tilapia with Sweet Potato", calories: 500, protein: 38, carbs: 40, fats: 15, prep_time: "25 min" }, snacks: [{ name: "Cottage Cheese", calories: 120, protein: 14, carbs: 5, fats: 5, prep_time: "2 min" }, { name: "Celery with Hummus", calories: 130, protein: 4, carbs: 12, fats: 8, prep_time: "3 min" }] },
  { day: "Thursday", breakfast: { name: "Whole Wheat Pancakes", calories: 390, protein: 14, carbs: 52, fats: 14, prep_time: "15 min" }, lunch: { name: "Chicken Caesar Wrap", calories: 460, protein: 30, carbs: 32, fats: 22, prep_time: "10 min" }, dinner: { name: "Beef Tacos with Salsa", calories: 540, protein: 32, carbs: 42, fats: 24, prep_time: "20 min" }, snacks: [{ name: "Protein Bar", calories: 200, protein: 20, carbs: 22, fats: 8, prep_time: "1 min" }, { name: "Orange", calories: 80, protein: 1, carbs: 19, fats: 0, prep_time: "1 min" }] },
  { day: "Friday", breakfast: { name: "Avocado Toast with Egg", calories: 420, protein: 18, carbs: 30, fats: 26, prep_time: "10 min" }, lunch: { name: "Quinoa Bowl with Veggies", calories: 430, protein: 16, carbs: 55, fats: 16, prep_time: "15 min" }, dinner: { name: "Shrimp Pasta", calories: 530, protein: 30, carbs: 55, fats: 18, prep_time: "25 min" }, snacks: [{ name: "Trail Mix", calories: 190, protein: 5, carbs: 20, fats: 12, prep_time: "1 min" }, { name: "Pear", calories: 100, protein: 1, carbs: 26, fats: 0, prep_time: "1 min" }] },
  { day: "Saturday", breakfast: { name: "Veggie Omelet", calories: 370, protein: 24, carbs: 10, fats: 26, prep_time: "12 min" }, lunch: { name: "Tuna Sandwich", calories: 440, protein: 30, carbs: 35, fats: 18, prep_time: "10 min" }, dinner: { name: "Roasted Chicken with Potatoes", calories: 560, protein: 42, carbs: 35, fats: 25, prep_time: "45 min" }, snacks: [{ name: "Yogurt Parfait", calories: 180, protein: 10, carbs: 25, fats: 5, prep_time: "5 min" }, { name: "Dark Chocolate Square", calories: 90, protein: 1, carbs: 10, fats: 6, prep_time: "1 min" }] },
  { day: "Sunday", breakfast: { name: "French Toast with Fruit", calories: 410, protein: 14, carbs: 55, fats: 16, prep_time: "15 min" }, lunch: { name: "Mediterranean Salad", calories: 400, protein: 12, carbs: 30, fats: 26, prep_time: "10 min" }, dinner: { name: "Grilled Pork Chops with Veggies", calories: 520, protein: 38, carbs: 20, fats: 30, prep_time: "30 min" }, snacks: [{ name: "Rice Cakes with PB", calories: 160, protein: 5, carbs: 22, fats: 7, prep_time: "2 min" }, { name: "Grapes", calories: 90, protein: 1, carbs: 23, fats: 0, prep_time: "1 min" }] },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1. AUTH — allow guests through with defaults
    let user = null;
    let userEmail = null;
    try {
      user = await base44.auth.me();
      userEmail = user?.email;
    } catch (authErr) {
      console.log("Auth check failed (guest mode):", authErr.message);
    }

    // 2. FETCH USER PROFILE — tolerant of missing profiles
    let profile = null;
    try {
      if (userEmail) {
        const profiles = await base44.entities.UserProfile.list();
        profile = profiles.find(p => p.created_by === userEmail) || null;
      }
      if (!profile) {
        // Try listing all (for guest mode where created_by may differ)
        const allProfiles = await base44.entities.UserProfile.list('-created_date', 1);
        profile = allProfiles[0] || null;
      }
    } catch (profileErr) {
      console.log("Profile fetch failed (using defaults):", profileErr.message);
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      // No body or invalid JSON — use defaults
    }

    const { diet, existingPlanId } = body;
    const dietFramework = diet || profile?.dietary_framework || 'Balanced';
    const zipCode = profile?.zip_code || '33166';

    // 3. FETCH LOCAL GROCERY DEALS VIA scanFlippDeals (non-blocking)
    let dealsContext = '';
    try {
      const searchTerms = [
        { id: 'produce', name: 'fresh vegetables', category: 'Produce' },
        { id: 'fruit', name: 'fresh fruit', category: 'Produce' },
        { id: 'chicken', name: 'chicken breast', category: 'Protein' },
        { id: 'beef', name: 'ground beef', category: 'Protein' },
        { id: 'fish', name: 'salmon fillet', category: 'Protein' },
        { id: 'eggs', name: 'eggs', category: 'Dairy' },
        { id: 'milk', name: 'milk', category: 'Dairy' },
        { id: 'rice', name: 'rice', category: 'Grains' },
        { id: 'bread', name: 'whole wheat bread', category: 'Grains' },
        { id: 'pasta', name: 'pasta', category: 'Grains' },
        { id: 'yogurt', name: 'greek yogurt', category: 'Dairy' },
        { id: 'cheese', name: 'cheese', category: 'Dairy' },
      ];

      const scanRes = await base44.functions.invoke('scanFlippDeals', {
        items: searchTerms,
        postal_code: zipCode,
      });

      if (scanRes.data?.success && scanRes.data.results?.length > 0) {
        const dealLines = [];
        for (const r of scanRes.data.results) {
          const topDeals = r.deals?.slice(0, 3) || [];
          for (const d of topDeals) {
            dealLines.push(`- ${d.name} at ${d.merchant}: $${d.price}${d.sale_story ? ' (' + d.sale_story + ')' : ''}`);
          }
        }
        if (dealLines.length > 0) {
          dealsContext = `\n\nCURRENT LOCAL GROCERY DEALS near zip ${zipCode}:\n${dealLines.join('\n')}\nPrioritize ingredients that are on sale to maximize savings. Track the estimated savings from using deal items vs regular price.`;
        }
      }
    } catch (err) {
      console.log("Flipp scan skipped (non-blocking):", err.message);
    }

    // 4. BUILD PROMPT WITH BIO-DATA + DEALS
    const personalContext = `USER GOALS & BIO:
- Daily Calorie Target: ${profile?.daily_calories || 2000} kcal
- Protein Goal: ${profile?.protein_goal || 'not set'}g | Carbs Goal: ${profile?.carbs_goal || 'not set'}g | Fats Goal: ${profile?.fats_goal || 'not set'}g
- Allergies to STRICTLY AVOID: ${profile?.allergies?.length ? profile.allergies.join(', ') : 'None'}
- Dislikes to AVOID: ${profile?.dislikes?.length ? profile.dislikes.join(', ') : 'None'}
- Health Objectives: ${profile?.health_goals?.length ? profile.health_goals.join(', ') : 'General Health'}
- Dietary Framework: ${dietFramework} (${DIET_RULES[dietFramework] || 'Standard balanced diet'})
- Activity Level: ${profile?.activity_level || 'moderately_active'}${dealsContext}`;

    // 5. SINGLE LLM CALL — full 7-day plan + savings
    let weeklyPlan = null;
    let calculatedSavings = 0;
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${personalContext}

Generate a complete 7-day meal plan for Monday through Sunday.
Each day must have a unique breakfast, lunch, dinner, and 2 snacks.
Ensure variety across all 7 days and stay within the daily calorie target.
${dealsContext ? 'Use on-sale ingredients where possible and calculate the estimated dollar savings from using deal items.' : ''}
Return calculated_savings as the estimated total dollar savings for the week from using deal-priced ingredients (0 if no deals provided).`,
        response_json_schema: {
          type: "object",
          properties: {
            weekly_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  breakfast: MEAL_SCHEMA,
                  lunch: MEAL_SCHEMA,
                  dinner: MEAL_SCHEMA,
                  snacks: { type: "array", items: MEAL_SCHEMA }
                },
                required: ["day", "breakfast", "lunch", "dinner", "snacks"]
              }
            },
            calculated_savings: {
              type: "number",
              description: "Estimated total dollar savings for the week from using deal-priced ingredients"
            }
          },
          required: ["weekly_plan", "calculated_savings"]
        }
      });

      weeklyPlan = res.weekly_plan;
      calculatedSavings = res.calculated_savings || 0;
    } catch (err) {
      console.error("LLM Generation Error:", err.message);
      // Use fallback plan instead of crashing
      weeklyPlan = FALLBACK_PLAN;
      calculatedSavings = 0;
      console.log("Using fallback meal plan.");
    }

    // 6. ESTIMATE COST & SAVE
    const estimatedDailyCost = dietFramework === 'Keto' ? 16 : dietFramework === 'Vegan' ? 12 : 14;
    const totalEstimatedCost = Math.round(estimatedDailyCost * 7 * 100) / 100;

    const planData = {
      created_by: userEmail || 'guest',
      week_start_date: new Date().toISOString().split('T')[0],
      meals: weeklyPlan,
      total_estimated_cost: totalEstimatedCost,
      potential_savings: Math.round(calculatedSavings * 100) / 100,
    };

    let result;
    try {
      if (existingPlanId) {
        result = await base44.entities.MealPlan.update(existingPlanId, planData);
      } else {
        result = await base44.entities.MealPlan.create(planData);
      }
    } catch (saveErr) {
      console.error("MealPlan save error:", saveErr.message);
      // Return the plan data even if saving failed
      return Response.json({ success: true, plan: planData, saved: false, note: "Plan generated but could not be saved." });
    }

    return Response.json({ success: true, plan: result });

  } catch (error) {
    console.error("generateMealPlan top-level error:", error.message);
    // Return fallback instead of 500
    return Response.json({
      success: true,
      plan: {
        week_start_date: new Date().toISOString().split('T')[0],
        meals: FALLBACK_PLAN,
        total_estimated_cost: 98,
        potential_savings: 0,
      },
      saved: false,
      note: "An error occurred. Showing a default meal plan."
    });
  }
});