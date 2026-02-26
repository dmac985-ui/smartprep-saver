import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { planId, dayName, mealType, snackIndex } = await req.json();

    if (!planId || !dayName || !mealType) {
      return Response.json({ error: 'Missing required fields: planId, dayName, mealType' }, { status: 400 });
    }

    // Fetch the meal plan
    const plan = await base44.entities.MealPlan.get(planId);
    if (!plan) return Response.json({ error: 'Meal plan not found' }, { status: 404 });

    // Find the target day
    const dayIndex = plan.meals.findIndex(d => d.day?.toLowerCase() === dayName.toLowerCase());
    if (dayIndex === -1) return Response.json({ error: `Day "${dayName}" not found in plan` }, { status: 404 });

    const dayMeals = plan.meals[dayIndex];

    // Get the original meal to match macros
    let originalMeal;
    if (mealType === 'snacks' && snackIndex !== null && snackIndex !== undefined) {
      originalMeal = dayMeals.snacks?.[snackIndex];
    } else {
      originalMeal = dayMeals[mealType];
    }

    if (!originalMeal) return Response.json({ error: `Meal type "${mealType}" not found for ${dayName}` }, { status: 404 });

    // Fetch user profile for allergies/dislikes
    const profiles = await base44.entities.UserProfile.list();
    const profile = profiles.find(p => p.created_by === user.email);

    const allergies = profile?.allergies?.join(', ') || 'None';
    const dislikes = profile?.dislikes?.join(', ') || 'None';
    const dietFramework = profile?.dietary_framework || 'Mediterranean';

    // Generate a single replacement meal via LLM
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate exactly 1 replacement ${mealType} meal for a ${dietFramework} diet.
It must be DIFFERENT from "${originalMeal.name}".
Match these approximate macros: ~${originalMeal.calories} calories, ~${originalMeal.protein}g protein, ~${originalMeal.carbs}g carbs, ~${originalMeal.fats}g fats.
MUST AVOID these allergies: ${allergies}
MUST AVOID these dislikes: ${dislikes}
Return a single meal object.`,
      response_json_schema: {
        type: "object",
        properties: {
          meal: MEAL_SCHEMA
        },
        required: ["meal"]
      }
    });

    const newMeal = result.meal;
    if (!newMeal?.name) {
      return Response.json({ error: 'LLM returned an invalid meal' }, { status: 500 });
    }

    // Apply the swap
    const updatedMeals = [...plan.meals];
    if (mealType === 'snacks' && snackIndex !== null && snackIndex !== undefined) {
      updatedMeals[dayIndex].snacks[snackIndex] = newMeal;
    } else {
      updatedMeals[dayIndex][mealType] = newMeal;
    }

    await base44.entities.MealPlan.update(planId, { meals: updatedMeals });

    return Response.json({ success: true, newMeal });

  } catch (error) {
    console.error("swapMeal error:", error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});