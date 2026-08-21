# Three envelopes — Vercel setup guide

Follow these steps in order. Steps 1–2 are the only manual ones; everything else is copy-paste.

---

## Step 1: Create a free Supabase project (the database)

1. Go to https://supabase.com and sign up (free tier is enough).
2. Click **New project**.
3. Give it any name (e.g. "envelopes"), set a database password (save it somewhere, you won't need it again for this), pick any region, and click **Create new project**. Wait ~1 minute for it to spin up.
4. Once it's ready, click the **SQL Editor** icon in the left sidebar.
5. Click **New query**, then open the file `supabase_setup.sql` from this project, copy its entire contents, and paste it into the SQL editor.
6. **Before running it**, edit the three placeholder messages in the pasted SQL (the lines starting with `insert into envelopes`) to your real messages. Keep the quotes around each message.
7. Click **Run** (bottom right). You should see "Success. No rows returned."
8. In the left sidebar, click **Settings** (gear icon) → **API**.
9. You'll need two values from this page, copy them somewhere safe:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **service_role key** (under "Project API keys" — click "Reveal" to see it). This is a secret key, don't share it publicly.

---

## Step 2: Create a free Vercel account and deploy

The easiest way with no command line is to put this project on GitHub first, then import it into Vercel. (Vercel doesn't have a pure drag-and-drop deploy like Netlify Drop — it wants a Git repo, or the CLI.)

1. Go to https://github.com and sign up if you don't have an account.
2. Click the **+** in the top right → **New repository**. Name it e.g. `three-envelopes`, keep it Private or Public (either works), click **Create repository**.
3. On the new repo page, click **uploading an existing file** (or **Add file → Upload files**).
4. Drag in all the files from this project folder: `index.html`, `package.json`, `supabase_setup.sql`, `README.md`, and the whole `api` folder (with `state.js` and `choose.js` inside it). GitHub's uploader supports dragging a folder in most browsers; if it doesn't pick up the `api` folder, drag `state.js` and `choose.js` in individually — GitHub will recreate the `api/` folder path automatically as long as you don't rename them.
5. Click **Commit changes**.
6. Go to https://vercel.com and sign up — choose **Continue with GitHub** so it's linked automatically.
7. On your Vercel dashboard, click **Add New** → **Project**.
8. Find your `three-envelopes` repo in the list and click **Import**.
9. Leave all the build settings as default (Vercel auto-detects the `api/` folder as serverless functions and serves `index.html` as-is — no build command needed).
10. Before clicking Deploy, expand **Environment Variables** and add two:
    - Key: `SUPABASE_URL` — Value: the Project URL you saved in Step 1
    - Key: `SUPABASE_SERVICE_KEY` — Value: the service_role key you saved in Step 1
11. Click **Deploy**. Wait ~1 minute. Vercel will give you a live URL (something like `three-envelopes-yourname.vercel.app`).

If you added the environment variables *after* deploying instead of before, go to **Project Settings → Environment Variables** to add them, then go to the **Deployments** tab, click the **⋯** menu on the latest deployment, and click **Redeploy** so they take effect.

---

## Step 3: Test it

1. Visit your live Vercel URL.
2. Click one envelope — it should reveal your real message.
3. Refresh the page — the same envelope should still show as opened, and the other two should stay locked, even on a different device or browser.

If something doesn't work, the most common cause is a typo in the two environment variable values — double check them against Supabase's API settings page. You can also check **Deployments → (latest) → Functions → Logs** in Vercel to see any error messages from `state` or `choose`.

---

## Sending it

Just send the Vercel URL to the person. That's it — no login required on their end.

## Changing the messages later

Go back to Supabase → **Table Editor** → `envelopes` table, and edit the `message` column directly for each row (only works before it's been opened, or if you also reset `opened` back to `false` for that row).
