# UnliSMS web portal

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui (Radix) + Lucide.
The visual reference is the Claude Design canvas **UnliSMS Portal**.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Phase 1 scope

| Route | Who | Notes |
| --- | --- | --- |
| `/login` | everyone | One sign-in for both portals; the account role picks the destination |
| `/dashboard` | `USER` | User portal |
| `/admin/dashboard` | `ADMIN` | Admin portal (`/admin` redirects here) |
| `/design-system` | everyone | Living reference of tokens and components |

Other sidebar links (Messages, Gateways, Webhooks, …) point at Phase 2 pages that don't exist yet.

### Authentication

Sign-in uses the OnSim API (`POST /v1/auth/login`, contract verified against onsim-api source). The server
action seals the returned bearer token and identity (AES-256-GCM) into the httpOnly
`unlisms_session` cookie; the token never reaches client JavaScript. `proxy.ts` routes
optimistically on that cookie, and `requireUser()` / `requireAdmin()` in `lib/auth/session.ts`
re-check in every portal layout and page. The OnSim API remains authoritative for data.

Copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
| --- | --- |
| `ONSIM_API_BASE_URL` | OnSim API base URL (server-only) |
| `SESSION_SECRET` | ≥ 32 random characters for sealing the session cookie (`openssl rand -base64 48`) |

Backend gaps: the API has no logout/revocation endpoint (sign-out clears the web session; the token
expires at its `expires_at`), no current-user endpoint (identity comes from the login response),
and no platform role — every account is `USER` and `/admin/*` stays closed until the API exposes
one (map it in `roleFrom()` in `lib/auth/session-cookie.ts`).

### Previewing states

In development, append `?mock=` to either dashboard:

- `?mock=empty` – new account with no data (empty states, `—` metrics)
- `?mock=error` – the data loader throws (route error state with “Try again”)
- `?mock=slow` – holds the loading skeleton for 1.5 s (navigate in from another route to see it)

## Structure

```
app/
  (auth)/login/          login page + form (server action in lib/auth/actions.ts)
  (user)/                user portal layout, /dashboard (+ loading, error)
  admin/                 admin portal layout, /admin/dashboard (+ loading, error)
  design-system/         component reference page
components/
  ui/                    shadcn/ui primitives styled to the UnliSMS tokens
  layout/                AppShell, AppSidebar, AppHeader, MobileNav, PageHeader, AccountMenu, nav config
  dashboard/             MetricCard, MetricStrip, MessageActivityChart, DeliveryRatePanel, GatewayStatusPanel,
                         WebhookActivityPanel, RecentMessagesTable, SystemHealthPanel, GatewayHealthPanel, …
  status/                StatusBadge + Message/Gateway/Webhook/Service status badges, PlanBadge
  feedback/              EmptyState, ErrorState, ListSkeleton, RouteError
lib/
  types/                 API-facing types (User, Gateway, SimSlot, Message, Webhook, DashboardMetrics, …)
  mock-data/             typed mock factories (Philippine carriers and numbers)
  data/                  data access used by pages – swap these bodies for API calls
  auth/                  OnSim login client, sealed session cookie, requireUser/requireAdmin
  format.ts              number / percent / time formatting (Asia/Manila)
proxy.ts                 optimistic role routing on the session cookie
```

### Replacing mock data

Pages only call `lib/data/*` and only depend on `lib/types`. To connect the API, reimplement
`getUserDashboard`, `getAdminDashboard`, `getUserShell` and `getAdminShell` to return the same
types; no component changes are needed. Mock data uses raw counts and ISO timestamps, so the UI
derives rates, percentages and relative times the same way it will for live data.

### Design tokens

Tokens live in `app/globals.css` under shadcn names (`primary`, `muted-foreground`, `accent`,
`destructive`, `input`, `ring`, `sidebar`, …) plus UnliSMS brand and status tokens (`brand`,
`brand-tint`, `success-*`, `warning-*`, `danger-*`, `offline`). Use the Tailwind utilities
(`bg-primary`, `text-muted-foreground`, `bg-brand`), not hex values. `components.json` is set up so
`npx shadcn add <component>` generates into `components/ui` with these tokens.
