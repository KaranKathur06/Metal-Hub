# MetalHub Auth State Integration

## Priority

Auth state is the next structural system to wire before industry navigation, taxonomy UI, or listing media.

## Added Building Blocks

- `components/auth/AuthProvider.tsx`
- `components/auth/AuthNavbarActions.tsx`
- `components/providers/MarketplaceProviders.tsx`
- `lib/marketplace/auth-navigation.ts`
- `lib/marketplace/auth-guards.ts`
- `lib/marketplace/platform-settings.ts`

## Root Provider Wiring

Wrap the application shell with:

```tsx
import { MarketplaceProviders } from "../components/providers/MarketplaceProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MarketplaceProviders>{children}</MarketplaceProviders>
      </body>
    </html>
  );
}
```

Adjust the import path if the layout lives under `src/app`.

## Navbar Wiring

Replace hardcoded Login/Register actions with:

```tsx
import { AuthNavbarActions } from "../components/auth/AuthNavbarActions";

export function Navbar() {
  return (
    <nav>
      {/* existing brand, links, and industry menu */}
      <AuthNavbarActions />
    </nav>
  );
}
```

Before login, it renders:

- Login
- Register

After login, it renders:

- completion prompt when onboarding is incomplete
- notification link
- dashboard link
- avatar menu
- role-aware buyer/seller navigation
- settings
- logout

## Session Behavior

The auth provider uses Supabase browser auth with:

- persistent sessions
- token refresh
- session hydration on page refresh
- `onAuthStateChange` listener
- marketplace profile loading
- company loading
- seller/buyer profile loading

If the `profiles` row is missing, the provider creates a safe in-memory fallback from Supabase user metadata. The database migration also creates a profile shell trigger for new users and backfills legacy users.

## Development Trust Mode Resolution

Resolution order:

1. `NEXT_PUBLIC_DEVELOPMENT_TRUST_MODE`
2. `platform_settings.development_trust_mode`
3. safe default: `true`

This keeps local testing and preview environments flexible while preserving database-controlled rollout later.

## Guard Behavior

Use `lib/marketplace/auth-guards.ts` for route/action decisions:

- `requireAuth`
- `requireRole`
- `requireCompletedOnboarding`

During development trust mode, onboarding guards return warnings/allowed states instead of hard blocks.

## Next Concrete Wiring Tasks

1. Wrap root layout with `MarketplaceProviders`.
2. Replace navbar auth buttons with `AuthNavbarActions`.
3. Replace role-specific dashboard links with `getDashboardHref`.
4. Add onboarding prompts using `onboardingIncomplete`.
5. Use `requireRole` for seller/buyer dashboard route decisions.
6. Keep hard gates disabled while `development_trust_mode` is true.

