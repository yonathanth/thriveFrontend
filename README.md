# Thrive Gym — website & admin

Public website and web admin panel for Thrive Gym. Next.js 16 + Tailwind 4.
Data comes from `thrive-gym-api`, which the desktop app syncs to.

## Setup

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at the API
npm run dev                  # http://localhost:3020
```

`NEXT_PUBLIC_API_URL` is read at **build** time, so on the server it must be in
`.env.local` before `npm run build`.

For local work with the outer `thriveBackend`, set
`NEXT_PUBLIC_API_URL=http://localhost:43125` in `.env.local`, run
`npm run start:dev` in the backend, and run `npm run dev` here. Open
`http://localhost:3020`; the backend API docs are at
`http://localhost:43125/api/docs`. Restart the frontend after changing this URL.
Files named `.env.env` are not loaded by Next.js; use `.env.local`.

## Where things live

| What | File |
| --- | --- |
| Name, domain, address, map, phone, hours, social links | `lib/site.ts` |
| Public routes and layout | `app/(public)/` |
| Shared website/auth fonts and base styles | `components/public/SiteFrame.tsx`, `components/public/site-frame.css` |
| Sign-in, password change and recovery styling | `components/auth/AuthShell.tsx`, `components/auth/auth.css` |
| Public design, navigation, tour, pricing and join preview | `components/public/` |
| Public pricing, memberships, offerings and service details | `lib/public/` |
| Landing page animation hook | `hooks/public/useLandingMotion.ts` |
| FAQ questions and answers | `lib/faq-content.ts` |
| Portal theme | `app/globals.css` (`@theme`) |
| Account routes | `app/login/`, `app/change-password/`, `app/(public)/forgot-password/` |
| Public design photos, logo and tour | `public/facilities/`, `public/services/`, `public/brand/`, `public/hero-athlete.jpg`, `public/awet.jpg`, `public/tour-*` |
| Existing portal photos | `public/images/` |
| Logo, favicons, social image | `public/logo.png`, `public/favicon/`, `public/og-image.png` |

## Public design migration

The public website now uses the pages, assets, fonts and animations from the
`thrive design` project. Routes are `/`, `/about`, `/services`, `/services/[slug]`,
`/pricing`, `/contact`, `/faq` and `/join`. Existing `/register` links redirect to
`/join` and preserve their query parameters. The footer links to the existing
member and staff sign-in page.

**Public pricing and schedules are static preview data** in `lib/public/`.
Fetching packages from `GET /api/site/catalog` is intentionally not connected to
these pages yet. `/join` uses local React state and demo payment outcomes: it
does not submit registrations, save customer details, charge payments, or activate
memberships. Wire these flows to the API in a later integration.

The API client, catalog helpers, authentication, role checks, and admin, member,
and trainer pages remain in place. Their existing API integrations are preserved.
The public layout scopes its fonts and base styles to `.thrive-public` so the
operational screens retain their existing theme.

Account screens share the website's visual foundation through `SiteFrame` and use
`AuthShell` for their layout. The sign-in and password-change API calls and role
redirects are unchanged. `/forgot-password` explains the existing front-desk reset
process; it does not submit an email reset. Unknown URLs and page errors use
branded fallback screens with home and retry actions.

All roles sign in at `/login`; legacy `/admin/login` links redirect there.
Admins and managers land on `/admin/dashboard`, trainers on `/trainer`, and members
on `/member`. Each portal's layout rejects other roles, and backend guards enforce
the same restrictions for its data. Temporary-password accounts must visit
`/change-password` first. Sign-in fills the viewport without navigation/footer bars,
keeps content reachable on short screens, and links prospective members to `/join`.

The public contact information and structured data use the design's phone,
Cheers meskelegna / Ayat Noah location, and 24/7 opening hours. The site domain
remains configured in `lib/site.ts`.

## Replacing placeholders

- **Public photos:** replace the matching assets in `public/facilities/`,
  `public/services/`, `public/hero-athlete.jpg`, `public/awet.jpg` and
  `public/tour-thumbnail.jpg`. The tour is `public/tour-video.mp4`.
- **Portal photos:** existing `public/images/` assets are kept for sign-in and
  operational screens.
- **Public logo:** replace `public/brand/thrive-logo.png`. Its display is handled
  by `components/public/BrandLogo.tsx`.
- **Favicons and app icons:** edit `public/favicon/favicon.svg`, then run
  `node scripts/favicon_assets.mjs` to regenerate SVG, ICO and PNG variants.
  Run this after the legacy brand generator below if using both.
- **Logo:** save it as `public/logo-source.png` (transparent PNG, square-ish), then
  `python scripts/brand_assets.py icons`. This rebuilds `logo.png`, every favicon,
  the PWA icons and `og-image.png`. Needs `pip install pillow`.
- **Text:** search for `TODO` in `lib/`.

## Deploy

Pushing to `master` runs `.github/workflows/main.yml`: pull, build, and (re)start the
`thrive-gym-app` PM2 process on the VPS (`npm start`, port 3020). Repository secrets:
`HOST`, `USERNAME`, `PRIVATE_KEY`, `SSH_PORT`. Point the domain's reverse proxy at
port 3020.
