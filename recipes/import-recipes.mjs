// One-time importer: recipes/recipes.json -> Supabase `recipes` table.
// Run locally with the service_role key (never in client-side code):
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node recipes/import-recipes.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars before running.');
}

const IMAGE_BASE_URL = 'https://omgsharon.github.io/Life/recipes/';
const recipesDir = path.dirname(fileURLToPath(import.meta.url));
const recipes = JSON.parse(readFileSync(path.join(recipesDir, 'recipes.json'), 'utf8'));

const rows = recipes.map(r => ({
  slug: r.id,
  title: r.title,
  category: r.category || null,
  ingredients: r.ingredients || [],
  instructions: r.instructions || [],
  notes: r.notes || null,
  nutrition: r.nutrition || null,
  image_path: r.image && existsSync(path.join(recipesDir, r.image)) ? IMAGE_BASE_URL + r.image : null,
}));

const BATCH_SIZE = 50;
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/recipes?on_conflict=slug`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(batch),
  });
  if (!res.ok) {
    throw new Error(`Batch ${i}-${i + batch.length} failed: ${res.status} ${await res.text()}`);
  }
  console.log(`Imported rows ${i + 1}-${i + batch.length} of ${rows.length}`);
}

console.log('Done.');
