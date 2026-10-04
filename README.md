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

### Preview sign-in (mock only)

Authentication is **not** implemented. `lib/auth/` sets a preview cookie holding a mock user id;
`proxy.ts` and the portal layouts route on its role. Any non-empty password works:

| Email | Role | Lands on |
| --- | --- | --- |
| `maria@acme.ph` | USER | `/dashboard` |
| `jun@unlisms.test` | ADMIN | `/admin/dashboard` |

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
  auth/                  mock session (preview only)
  format.ts              number / percent / time formatting (Asia/Manila)
proxy.ts                 optimistic role routing for the mock session
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
