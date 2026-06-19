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
CREATE POLICY "auth insert recipes" ON recipes FOR INSERT USING (auth.role() = 'authenticated');

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "auth modify tasks" ON tasks FOR INSERT, UPDATE, DELETE USING (auth.role() = 'authenticated');
```

5. Wire the keys into the demo:
- Open `recipes/supabase-client.js` and replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your project values.
- Or keep the file unchanged and set keys via a small script on your pages (not recommended to expose service role keys).

6. Open `recipes/demo-supabase.html` in your browser (or push to GitHub Pages). The page demonstrates listing and adding recipes and tasks.

Security notes:
- Never embed the `service_role` key in client-side code. Use serverless functions for privileged operations.
- Monitor usage limits on the free tier and consider using image CDN (Cloudinary) or edge functions if you expect heavy traffic.
