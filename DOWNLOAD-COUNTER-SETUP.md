# Enable the book download counter

The site uses Upstash Redis to keep one shared download total across visitors.

1. In the Vercel dashboard, open this project and create or connect an Upstash Redis database from **Storage**.
2. In the database settings, copy its REST URL and create a new REST token if the existing token has been shared.
3. In the Vercel project, open **Settings → Environment Variables** and add:
   - `KV_REST_API_URL` — the database REST URL
   - `KV_REST_API_TOKEN` — a write-enabled database REST token
4. Redeploy the site.

After deployment, the homepage displays the shared total and each click on **Download Book** increments it. If the database is not configured or is temporarily unavailable, downloads still open and the homepage reports that the count is unavailable.

The counter starts at zero when first enabled; downloads made before it was enabled cannot be recovered.

The endpoint also accepts `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for compatibility with existing Vercel projects. Do not put database credentials in source files or commit them to the repository.
