# Next Wiring Targets

## Immediate Priority

Wire global auth state before building standalone auth pages.

The first real wiring pass should include layout/navbar plus a minimal supplier-card trust chip. Keep supplier-card trust lightweight in this pass.

## Layout Target

Find the root application shell:

- `app/layout.tsx`
- `src/app/layout.tsx`
- `pages/_app.tsx`
- a custom provider file already imported by the layout

Wrap the existing page tree with:

```tsx
import { MarketplaceProviders } from "@/components/providers/MarketplaceProviders";

<MarketplaceProviders>{children}</MarketplaceProviders>
```

If the project does not use path aliases, use the correct relative import.

## Navbar Target

Find the current navbar/header component and replace only the hardcoded auth action area:

```tsx
import { NavbarAuthSlot } from "@/components/auth/NavbarAuthSlot";

<NavbarAuthSlot />
```

Do not rewrite the full navbar yet. Preserve:

- existing branding
- existing primary navigation
- existing routing
- existing marketplace links

For industry navigation, replace hardcoded arrays with:

```tsx
import { IndustryRegistryMenu } from "@/components/marketplace/IndustryRegistryMenu";

<IndustryRegistryMenu mode="desktop" />
```

For mobile navigation:

```tsx
<IndustryRegistryMenu mode="mobile" />
```

The menu reads from `taxonomy`, filters active industry nodes, supports search, and links to `/industries/[slug]`.

Do not introduce new hardcoded industry lists in navbar, homepage, filters, or forms.

Remove hardcoded Login/Register rendering from the authenticated state only after the slot is confirmed working.

## Seller Onboarding Target

Use:

- `lib/marketplace/seller-onboarding.ts`
- `components/onboarding/SellerOnboardingProgress.tsx`

Rules:

- multi-step modular flow
- save and resume
- skip for now during development trust mode
- draft state persistence
- progress tracking
- progression language, not compliance language

Recommended steps:

1. Account Setup
2. Company Information
3. Factory & Capabilities
4. Documents
5. First Listing
6. Profile Enhancement

## Supplier Card Trust Target

Find the marketplace listing/supplier card component and add:

```tsx
import { MinimalSupplierTrustChip } from "@/components/marketplace/MinimalSupplierTrustChip";

<MinimalSupplierTrustChip
  trustScore={supplier.trustScore}
  trustLevel={supplier.trustLevel}
/>
```

Pass 1 should show only the badge-level signal:

- Verified Supplier
- Trusted Supplier

Do not expose `Business Profile Complete` publicly. It is an internal progress signal for dashboards, onboarding, and supplier settings.

Do not expose profile percentages, behavior metrics, response graphs, or full trust breakdowns on the first supplier-card pass.

Expanded supplier-card trust can later use:

```tsx
import { SupplierCardTrustSignals } from "@/components/marketplace/SupplierCardTrustSignals";

<SupplierCardTrustSignals
  variant="expanded"
  trustScore={supplier.trustScore}
  trustLevel={supplier.trustLevel}
  profileCompletionPercent={supplier.profileCompletionPercent}
  responseTimeHours={supplier.responseTimeHours}
  locationLabel={supplier.locationLabel}
/>
```

## Product Card Trust Target

Product cards should use compact trust only:

```tsx
import { ProductCardTrustChip } from "@/components/marketplace/ProductCardTrustChip";

<ProductCardTrustChip
  trustLevel={supplier.trustLevel}
/>
```

Product discovery should still prioritize:

- product image
- product title
- specifications
- MOQ
- RFQ CTA

Trust density must match decision depth.

## Listing Media Target

Listing cards should render media through:

```tsx
import { ProductListingCard } from "@/components/marketplace/ProductListingCard";

<ProductListingCard
  href={`/listings/${listing.slug}`}
  title={listing.title}
  supplierName={listing.supplierName}
  media={listing.media}
  trustLevel={listing.supplierTrustLevel}
  trustScore={listing.supplierTrustScore}
  moq={listing.moq}
  leadTime={listing.leadTime}
  locationLabel={listing.locationLabel}
  primarySpec={listing.primarySpec}
/>
```

Media rules:

- primary image first
- lazy loaded previews
- technical chips for PDF, CAD, and video
- industrial fallback when no media exists
- compact verified/trusted supplier chip only

Do not put expanded supplier trust analytics on product cards.

## Onboarding Session Target

Draft onboarding state belongs in `onboarding_sessions`, not directly in `profiles`, `seller_profiles`, or `companies`.

Use:

- `lib/marketplace/onboarding-session.ts`

The workflow is:

1. Save draft data into `onboarding_sessions.draft_payload`.
2. Track `current_step`, `completion_percentage`, `skipped_steps`, and `last_completed_step`.
3. Store skipped step metadata in `skipped_step_details`.
4. Validate a step checkpoint.
5. Commit confirmed data into `profiles`, `companies`, and `seller_profiles`.
6. Keep development-mode skip behavior enabled until production enforcement is ready.

There should be exactly one active onboarding draft per user, role, flow key, and flow version. Completed, abandoned, and archived sessions remain as history.

Skipped steps should persist. They should trigger progressive nudges, not forced expiration loops.

## Location Hierarchy Target

Replace free-text location fields with:

```tsx
import { CascadingLocationSelect } from "@/components/marketplace/CascadingLocationSelect";

<CascadingLocationSelect
  value={{
    countryId,
    stateId,
    cityId,
  }}
  onChange={(nextLocation) => {
    setCountryId(nextLocation.countryId);
    setStateId(nextLocation.stateId);
    setCityId(nextLocation.cityId);
  }}
/>
```

Location rules:

- store `country_id`, `state_id`, and `city_id`
- country change clears state and city
- state change clears city
- lazy-load states by selected country
- lazy-load cities by selected state
- cache loaded location options client-side
- keep free-text factory address as a separate address line only

Use this in:

- company onboarding
- factory profile
- buyer business profile
- listing location
- marketplace filters

## Auth Pages Come After

Build these only after global state is wired:

- login
- register
- OTP verification
- forgot password
- reset password
- security settings
- MFA setup
- session management

This avoids duplicated session logic and inconsistent redirects.

## Procurement Workflow Target

RFQ, quote, and messaging flows should consume:

```tsx
import { evaluateProcurementGate } from "@/lib/marketplace/procurement-gates";
import { ProcurementGateNotice } from "@/components/marketplace/ProcurementGateNotice";
```

Use trust-aware soft gates in development mode:

- publishing RFQs
- contacting suppliers
- submitting quotes
- accessing premium RFQs
- featured supplier visibility

In development trust mode:

- actions can remain available
- notices should explain how to improve trust
- do not hard-block unless development mode is disabled

Use workflow helpers for status transitions:

```tsx
import { canTransitionRfq, canTransitionQuote } from "@/lib/marketplace/procurement-workflow";
import { getRfqActionAvailability } from "@/lib/marketplace/rfq-actions";
```

Keep all procurement tables additive and nullable-first:

- `rfqs`
- `quotes`
- `message_threads`
- `messages`

## Seller Trust Improvement Target

Supplier dashboards should render trust nudges through:

```tsx
import { SellerTrustImprovementPanel } from "@/components/marketplace/SellerTrustImprovementPanel";
```

Use it with:

- profile completion result
- onboarding session
- current trust level
- verification status
- whether the supplier has listings
- development trust mode

Improvement prompts should stay private. They belong on dashboards, onboarding flows, and supplier settings, not marketplace cards.

## Email Integration Target

Auth and security emails should use:

```tsx
import { buildAuthEmail } from "@/lib/email/build-auth-email";
import { createQueuedEmailLog, createSentEmailLogPatch, createFailedEmailLogPatch } from "@/lib/email/email-log";
```

Template registry:

```tsx
import { getAuthEmailTemplate } from "@/lib/email/auth-email-templates";
```

Supported auth/security templates:

- confirm signup OTP
- welcome
- forgot password
- password changed
- email changed
- phone changed
- identity linked
- identity unlinked
- MFA added
- MFA removed

Provider integration contract:

1. Build `subject`, `html`, and `text` with `buildAuthEmail`.
2. Insert queued row into `email_logs`.
3. Send with provider adapter such as Resend, Postmark, or SES.
4. Patch `email_logs` with sent or failed status and provider message ID.

Keep email templates provider-agnostic. Do not hard-wire business logic into the sending provider client.

## Security And Session Target

Security settings should use:

```tsx
import { SecuritySettingsPanel } from "@/components/auth/SecuritySettingsPanel";
import { createAuditLogEntry } from "@/lib/marketplace/audit-events";
```

Use `SecuritySettingsPanel` for:

- email verification state
- phone verification state
- MFA state
- active session list
- revoke session actions

Use `createAuditLogEntry` when recording:

- sign-in
- sign-out
- password changes
- email changes
- MFA enabled or disabled
- session revocation

Security actions should update `audit_logs` and trigger the corresponding auth/security email where relevant.

## Supplier Directory And Profile Target

Supplier search and profile pages should use:

```tsx
import { SupplierDirectoryCard } from "@/components/marketplace/SupplierDirectoryCard";
import { SupplierProfileTrustSummary } from "@/components/marketplace/SupplierProfileTrustSummary";
```

Directory cards:

- keep trust light
- show only public verified/trusted chip
- prioritize supplier name, industry, location, and concise summary

Supplier profiles:

- can show fuller trust context
- include verified business state
- include response speed
- include certifications

## SEO Target

Industry, supplier, and listing pages should use:

```tsx
import { buildSeoMetadata, buildIndustrySchema, buildSupplierSchema, buildListingSchema } from "@/lib/marketplace/seo";
```

Use:

- `buildIndustrySchema` on `/industries/[slug]`
- `buildSupplierSchema` on supplier profile pages
- `buildListingSchema` on listing detail pages

Keep metadata sourced from taxonomy, company, seller profile, and listing data instead of hardcoded copy.

## Verification Workflow Target

Verification operations should use:

```tsx
import { VerificationReviewQueue } from "@/components/marketplace/VerificationReviewQueue";
import { SupplierVerificationSummary } from "@/components/marketplace/SupplierVerificationSummary";
import { getVerificationStatusLabel } from "@/lib/marketplace/verification-documents";
```

Use `VerificationReviewQueue` for internal/admin review surfaces.

Use `SupplierVerificationSummary` for private supplier-facing progress surfaces.

Do not expose raw document review workflow publicly on marketplace cards.

## Internal Operations Role Target

Support an internal `supplier_success` role immediately.

This role should have access to:

- supplier operations dashboard
- verification queue
- onboarding review surfaces
- review notes
- audit context

Keep `admin` reserved for:

- platform configuration
- security governance
- policy enforcement
- high-risk moderation and escalation

Do not route `supplier_success` through the normal user notification center as the primary workflow.

The first internal nav exposure should be a single:

- `Verification Queue`

Use a separate ops queue surface for:

- verification backlog
- recently submitted suppliers
- suppliers needing follow-up

Keep the first supplier success dashboard verification-first and operationally narrow.

## Notification Target

Notifications should use:

```tsx
import { NotificationCenter } from "@/components/marketplace/NotificationCenter";
import { NotificationBellBadge } from "@/components/marketplace/NotificationBellBadge";
import { createNotification, countUnreadNotifications } from "@/lib/marketplace/notifications";
```

Use notification types for:

- trust
- verification
- RFQ
- quote
- message
- security

Drive the navbar bell from unread count and keep full notification history on a dedicated notifications page or drawer.

## Buyer Procurement Target

Buyer-side procurement surfaces should use:

```tsx
import { RfqSummaryCard } from "@/components/marketplace/RfqSummaryCard";
import { BuyerProcurementPromptPanel } from "@/components/marketplace/BuyerProcurementPromptPanel";
```

Use `RfqSummaryCard` for buyer dashboard RFQ lists, saved RFQs, and procurement activity views.

Use `BuyerProcurementPromptPanel` to show soft readiness prompts before publishing RFQs or contacting suppliers. Keep the language progression-oriented and compatible with development trust mode.

## Runtime Blocker

Actual file wiring and validation require repository inspection. Current blockers:

- PowerShell host fails before command execution.
- Node REPL resolves to Node `22.20.0`, but requires `22.22.0+`.

After runtime recovery, validate:

- provider hydration on refresh
- navbar before/after login
- seller/buyer/both menu rendering
- logout state reset
- development trust mode override
- onboarding incomplete prompt
- supplier-card trust rendering
