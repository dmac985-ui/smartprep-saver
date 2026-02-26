import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MIAMI_MERCHANTS = [
  'Publix', 'Walmart', 'Fresco y Más', "Sedano's", 'Bravo',
  'Winn-Dixie', 'Aldi', 'The Fresh Market', 'CVS', 'Walgreens', 'Kroger'
];

function extractMerchant(item) {
  // Rule 1: If merchant field exists and is non-empty
  if (item.merchant && item.merchant.trim() !== '') return item.merchant.trim();
  // Rule 2: Scan description + name for known merchants
  const haystack = `${item.description || ''} ${item.name || ''}`.toLowerCase();
  for (const m of MIAMI_MERCHANTS) {
    if (haystack.includes(m.toLowerCase())) return m;
  }
  // Rule 3: Fallback
  return 'Other Store';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { items, postal_code } = await req.json();
    if (!items?.length) return Response.json({ error: 'No items' }, { status: 400 });

    const zip = postal_code || '33166';
    const allResults = [];
    const batchSize = 5;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const promises = batch.map(async (groceryItem) => {
        try {
          const url = `https://backflipp.wishabi.com/flipp/items/search?locale=en_US&postal_code=${encodeURIComponent(zip)}&q=${encodeURIComponent(groceryItem.name)}&limit=10`;
          const resp = await fetch(url, {
            headers: { 'User-Agent': 'SmartPrepSaver/1.0', 'Accept': 'application/json' },
          });
          if (!resp.ok) return { item: groceryItem, deals: [] };
          const data = await resp.json();

          const deals = (data.items || [])
            .filter(d => d.name && d.current_price && d.current_price > 0)
            .map(d => ({
              name: d.name || '',
              merchant: extractMerchant(d),
              merchant_logo: d.merchant_logo || null,
              price: d.current_price,
              pre_price: d.pre_price_text || null,
              image_url: d.image_url || d.cutout_image_url || null,
              valid_to: d.valid_to || null,
              sale_story: d.sale_story || '',
            }));

          return { item: groceryItem, deals };
        } catch {
          return { item: groceryItem, deals: [] };
        }
      });
      const batchResults = await Promise.all(promises);
      allResults.push(...batchResults);
    }

    return Response.json({ success: true, results: allResults, postal_code: zip });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});