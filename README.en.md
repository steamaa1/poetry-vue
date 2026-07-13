# Poetry Letter · Chinese Poetry Vue

[Simplified Chinese (default)](README.md) | [Traditional Chinese](README.zh-Hant.md) | [English](README.en.md)

A responsive Chinese classical poetry website built with Vue 3, Vite, and the [Poetry Spring API](https://poetry.palemoky.com/).

## Features

### Poetry Reading

- Randomly recommends classical poems and supports filtering by dynasty and genre.
- Supports Simplified and Traditional Chinese UI, with an independent script switch for poem content.
- Supports local favorites, copying the complete poem, native sharing, and poem-specific links.
- Opens translation and analysis searches and generates downloadable poetry cards with an ink-wash background, cinnabar seal, and poem link.
- Includes a character lookup mode that opens Chinese dictionary definitions for selected characters.
- Provides immersive fullscreen reading with mobile safe-area, long-poem, and Traditional Chinese font support.
- Uses browser-style reading history with back and forward navigation between viewed poems.

### Search and Poetry Collection

- Searches full text, titles, poem content, and authors with keyword highlighting and pagination.
- Includes a Flying Flower game that finds a random poem containing a chosen Chinese character.
- Includes poetry browsing, collection statistics, an author directory, a dynasty timeline, and genre knowledge cards.
- Supports random reading by author, dynasty, or genre and provides author biography searches.

### Poetry Gathering

- Provides a separate Poetry Gathering page and a mobile interaction drawer.
- The Daily Poem remains fixed for the same date and records the consecutive reading streak.
- The calendar marks previously read dates and allows revisiting saved daily poems.
- Complete the Missing Verse asks the user to restore the following line and includes answer validation, difference feedback, answer reveal, and local score tracking.

### Interface and Reliability

- Provides desktop dropdown navigation and mobile fixed-bottom navigation with drawers.
- The home page and Poetry Gathering share the site directory, footer, poetry card generator, and Traditional Chinese language file.
- Every API request uses a 10-second timeout and up to two automatic retries.
- Includes a standalone API status page for checking important endpoints and latency.
- Includes same-origin API proxy adapters for Cloudflare Pages, Cloudflare Workers, Vercel, and Netlify.
- Includes responsive layouts and compatibility fixes for mobile safe areas and fixed navigation bars.

## Roadmap

Only unfinished features are listed below. The original planning numbers are preserved.

### Favorites and Reading Experience

- [ ] **9. Favorites management:** Search, sort, delete individual items, clear all, and import/export TXT or JSON.
- [ ] **12. Typography settings:** Adjust font size, line spacing, letter spacing, alignment, and vertical writing.

### Poetry Interactions

- [ ] **23. Linked Verse:** Continue a poem from the previous line or final character as a true poetry-chain game.
- [ ] **24. Poetry Riddle:** Hide the poet or title and guess the source from the poem text.

### Offline Support

- [ ] **30. Offline cache:** Use a Service Worker to cache site resources, recently viewed poems, and favorites.

## Language Files

- Simplified Chinese is the default language and is maintained in the `zhHans` object inside `src/App.vue`.
- Traditional Chinese is maintained in `src/locales/zh-Hant.js`.
- Traditional Chinese messages are merged with the default Simplified Chinese messages. Missing translations automatically fall back to Simplified Chinese.
- Simplified and Traditional poem content is returned by the Poetry Spring API through the `lang=zh-Hans / zh-Hant` parameter and is not converted by the frontend language files.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build output is generated in `dist/`.

## Deployment

Before deployment, fork this repository to your GitHub account or import it directly:

```text
https://github.com/steamaa1/chinese-poetry-vue
```

After deployment, open the following URLs to verify the site:

```text
https://your-domain.example/
https://your-domain.example/yaji.html
https://your-domain.example/api/stats
```

If `/api/stats` returns JSON, the API proxy is working.

### Cloudflare Pages

1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Open **Workers & Pages** from the sidebar.
3. Click **Create application**.
4. Select **Pages**.
5. Click **Connect to Git**.
6. Connect GitHub and select the `chinese-poetry-vue` repository.
7. Enter the following build settings:

```text
Production branch: main
Framework preset: Vue
Build command: npm run build
Build output directory: dist
Root directory: /
```

8. Leave environment variables empty.
9. Click **Save and Deploy**.
10. Wait for the build to finish and open the assigned `pages.dev` domain.
11. Open `/api/stats` and confirm that it returns poetry statistics JSON.
12. Open `/yaji.html` and confirm that Poetry Gathering loads correctly.

To add a custom domain:

1. Open the Pages project.
2. Click **Custom domains**.
3. Click **Set up a custom domain**.
4. Enter your domain.
5. Confirm the DNS records as instructed.
6. Wait until the certificate status becomes **Active**.

Future pushes to the `main` branch will trigger automatic deployments.

### Cloudflare Workers

1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Open **Workers & Pages**.
3. Click **Create application**.
4. Select **Import a repository**.
5. Connect GitHub and choose `chinese-poetry-vue`.
6. Keep the project name as `chinese-poetry-vue` or choose another name.
7. Set the Build command to:

```text
npm run build
```

8. Set the Deploy command to:

```text
npx wrangler deploy
```

9. Keep the Root directory at the repository root.
10. Leave environment variables empty.
11. Click **Deploy**.
12. Open the assigned `workers.dev` domain after deployment.
13. Open `/api/stats` and confirm that it returns JSON.
14. Open `/yaji.html` and confirm that Poetry Gathering loads correctly.

Command-line deployment:

```bash
npm install
npm run build
npx wrangler login
npx wrangler deploy
```

To add a custom domain:

1. Open the Worker project.
2. Open **Settings**.
3. Open **Domains & Routes**.
4. Click **Add**.
5. Select **Custom Domain**.
6. Enter the domain and confirm.

### Vercel

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New**.
3. Select **Project**.
4. Find `chinese-poetry-vue` in the GitHub repository list.
5. Click **Import**.
6. Confirm the following project settings:

```text
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 20.x or newer
```

7. Leave Environment Variables empty.
8. Click **Deploy**.
9. Open the assigned Vercel domain after deployment.
10. Open `/api/stats` and confirm that it returns JSON.
11. Open `/yaji.html` and confirm that Poetry Gathering loads correctly.

To add a custom domain:

1. Open the Vercel project.
2. Click **Settings**.
3. Click **Domains**.
4. Enter your domain.
5. Click **Add**.
6. Add or update the DNS records shown by Vercel.
7. Wait until the domain reports a valid configuration.

Future pushes to the `main` branch will trigger automatic deployments.

### Netlify

1. Sign in to [Netlify](https://app.netlify.com/).
2. Click **Add new site**.
3. Select **Import an existing project**.
4. Select **Deploy with GitHub**.
5. Authorize GitHub and choose the `chinese-poetry-vue` repository.
6. Confirm the following build settings:

```text
Base directory: leave empty
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

7. Leave environment variables empty.
8. Click **Deploy chinese-poetry-vue**.
9. Open the assigned Netlify domain after deployment.
10. Open `/api/stats` and confirm that it returns JSON.
11. Open `/yaji.html` and confirm that Poetry Gathering loads correctly.

To add a custom domain:

1. Open the Netlify site.
2. Click **Domain management**.
3. Click **Add a domain**.
4. Select **Add a domain you already own**.
5. Enter the domain and confirm.
6. Configure DNS as instructed.
7. Wait for the HTTPS certificate to be issued.

Future pushes to the `main` branch will trigger automatic deployments.

## Data Sources

- API: [Poetry Spring](https://poetry.palemoky.com/)
- Project: [palemoky/chinese-poetry-api](https://github.com/palemoky/chinese-poetry-api)

## License

The source code and original assets are released under the [MIT License](LICENSE). Copyright © 2026 Jiacheng.

Poetry data is provided by the Poetry Spring API. Third-party data, fonts, icons, and other external resources remain subject to their respective licenses or terms of use and are not covered by this project's MIT License.

---

Developed with assistance from **GPT5.6-Sol**
