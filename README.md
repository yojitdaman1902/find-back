# FindBack

FindBack is a campus lost-and-found platform that helps students report missing belongings, discover found items, verify ownership privately, and reconnect through secure messaging.

## Features

- **Lost and found reports** with descriptions, categories, colors, locations, dates, and images
- **Multi-signal matching** that compares structured and text-based report details to surface relevant matches
- **Private ownership verification** using questions and clues that are not exposed in public listings
- **Verified-participant chat** for communication after a potential match is established
- **Public found-items catalog** with search, filtering, and active-listing statistics
- **My Activity dashboard** for managing reports, reviewing matches, and viewing recovered-item history
- **Recovery lifecycle** that removes recovered items from active listings, recommendations, notifications, and matching while preserving them in the owner’s history
- **Supabase authentication and row-level security** for user accounts and private data
- **Responsive React interface** designed for mobile and desktop campus use

## Tech stack

- React 19 and TypeScript
- Vite
- React Router
- Tailwind CSS with customized shadcn/ui components
- Supabase Auth and PostgreSQL
- TanStack React Query
- Playwright end-to-end tests
- Lucide icons

## Getting started

### Prerequisites

- Node.js 20 or newer
- A Supabase project with the FindBack schema and policies configured

### Install and run locally

```bash
npm install
npm run dev
```

The development server is available at the URL printed by Vite, usually `http://localhost:5173`.

### Supabase configuration

The browser client is defined in [`src/integrations/supabase/client.ts`](src/integrations/supabase/client.ts). For a separate deployment, configure it with your own **public** Supabase project URL and publishable key. Never place a Supabase service-role key or another server secret in browser code.

The application expects these Supabase resources:

- `reports`
- `report_match_features`
- `ownership_verifications`
- `ownership_verification_clues`
- `ownership_verification_attempts`
- `chat_messages`
- `profiles`

All user-owned tables should have Row Level Security enabled. Authenticated access must be restricted to the appropriate user or verified conversation participants.

> Database schema changes are managed through the connected Supabase project rather than checked-in migration files in this repository.

## Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run build:dev` | Create a development-mode build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Playwright end-to-end test suite |

The Playwright configuration uses an already-running application server. Set `DYAD_TEST_BASE_URL` when the test target is not the default preview URL.

## Application flow

1. A user submits a lost or found report with descriptive details and optional images.
2. FindBack creates matching features from the report’s category, description, color, location, and time signals.
3. Potential matches are ranked and shown to authenticated users.
4. A claimant completes private ownership verification using information that should only be known by the true owner.
5. Verified participants can communicate through chat and coordinate recovery.
6. When an item is recovered, it remains available in the owner’s history but is removed from all active discovery and matching surfaces.

## Project structure

```text
src/
├── components/       Shared UI, providers, and application components
├── integrations/     Supabase client setup
├── lib/              Data access, matching, and shared utilities
├── pages/            Route-level React pages
└── App.tsx           Router and application providers

e2e-tests/            Playwright end-to-end tests
```

## Testing coverage

The end-to-end suite covers:

- Reporting and browsing found items
- Match discovery and match details
- Ownership verification flows
- Verified chat
- My Activity and recovered-item history
- Removal of recovered listings from active discovery

## Security and privacy

- Keep private ownership answers out of public UI, URLs, logs, screenshots, and issue reports.
- Use only publishable Supabase credentials in the frontend.
- Keep RLS enabled on every exposed table and review policies whenever the data model changes.
- Do not grant unauthenticated access to user-owned data unless a feature explicitly requires it.
- Treat recovered reports as historical records only; they must not become active matches or public listings again.

## Contributing

1. Create a focused branch for your change.
2. Keep UI, data-access, and security changes scoped to the feature being added.
3. Run the linter, production build, and relevant Playwright tests before opening a pull request.
4. Do not commit credentials, private ownership clues, test accounts, or generated test results.

## License

No license has been specified yet. Add a license file before distributing this project for reuse.
