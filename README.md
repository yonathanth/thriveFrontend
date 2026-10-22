# Thrive Gym — website & admin

Public website and web admin panel for Thrive Gym. Next.js 16 + Tailwind 4.
Data comes from `thrive-gym-api`, which the desktop app syncs to.

## Setup

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at the API
npm run dev                  # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` is read at **build** time, so on the server it must be in
`.env.local` before `npm run build`.

## Where things live

| What | File |
| --- | --- |
| Name, domain, address, map, phone, hours, social links | `lib/site.ts` |
| Public routes and public-only layout/fonts | `app/(public)/` |
| Public design, navigation, tour, pricing and join preview | `components/public/` |
| Public pricing, memberships, offerings and service details | `lib/public/` |
| Landing page animation hook | `hooks/public/useLandingMotion.ts` |
| FAQ questions and answers | `lib/faq-content.ts` |
| Portal theme | `app/globals.css` (`@theme`) |
| Public base styles | `app/(public)/public.css` |
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
`thrive-gym-app` PM2 process on the VPS (`npm start`, port 3000). Repository secrets:
`HOST`, `USERNAME`, `PRIVATE_KEY`, `SSH_PORT`. Point the domain's reverse proxy at
port 3000.
