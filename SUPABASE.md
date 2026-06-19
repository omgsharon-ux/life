# Supabase setup for this repo

1. Create a Supabase project at https://app.supabase.com and copy the `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

2. Create a storage bucket named `dashboard` (Settings → Storage). If you want direct image URLs, mark the bucket public.

3. Run this SQL in the Supabase SQL editor to create the necessary tables:

```
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  ingredients jsonb,
  instructions text,
  image_path text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  due_date date,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

4. (Optional but recommended) Enable Row Level Security and add policies:

```
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read recipes" ON recipes FOR SELECT USING (true);
CREATE POLICY "auth insert recipes" ON recipes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "auth insert tasks" ON tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth update tasks" ON tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth delete tasks" ON tasks FOR DELETE USING (auth.role() = 'authenticated');
```

5. Wire the keys into the demo:
- Open `recipes/supabase-client.js` and replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your project values.
- Or keep the file unchanged and set keys via a small script on your pages (not recommended to expose service role keys).

6. Open `recipes/demo-supabase.html` in your browser (or push to GitHub Pages). The page demonstrates listing and adding recipes and tasks.

7. To import the existing recipes from `recipes/recipes.json` into the `recipes` table, first extend the schema to hold the extra fields (category, notes, nutrition) and switch `instructions` to an array:

```
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS nutrition jsonb;

ALTER TABLE recipes ALTER COLUMN instructions TYPE jsonb USING to_jsonb(instructions);
```

Then run the importer from your machine (never from the browser — it needs the `service_role` key, which must stay off the client):

```
export SUPABASE_URL=https://birzjhrysrjjvbyzsfoc.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<service_role key from Supabase Settings → API>
node recipes/import-recipes.mjs
```

The script upserts by `slug` (the recipe's `id` in the JSON), so it's safe to re-run after fixing data. Images aren't uploaded to storage — `image_path` is set to the recipe's existing GitHub Pages URL (e.g. `https://omgsharon.github.io/Life/recipes/images/<file>`), so the site keeps serving images straight from the repo.

Security notes:
- Never embed the `service_role` key in client-side code. Use serverless functions for privileged operations.
- Monitor usage limits on the free tier and consider using image CDN (Cloudinary) or edge functions if you expect heavy traffic.
