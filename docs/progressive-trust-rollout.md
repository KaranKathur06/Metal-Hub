# MetalHub Progressive Trust Rollout

## Current Stage

MetalHub is in development and testing. Trust infrastructure should collect signals and render credibility indicators without blocking testers, early suppliers, or seed inventory.

## Runtime Rule

All development should use:

- Node `22.22.0`
- `pnpm@10.11.0`
- no mixed npm, yarn, or alternate Node versions

## Rollout Flags

Use `platform_settings.development_trust_mode`.

When `true`:

- incomplete profiles can continue testing flows
- trust gates return warnings instead of hard blocks
- verification documents can remain draft or pending
- badges and completion meters still render
- ranking boosts can be simulated

When `false`:

- action gates may enforce tier requirements
- feature-specific restrictions can activate
- grace periods should still protect existing users

## First Implementation Boundary

Implement these systems before strict enforcement:

1. Global auth provider with Supabase session listener.
2. Role-aware navbar and dashboard menu.
3. Profile shell creation for every authenticated user.
4. Seller and buyer profile records.
5. Company profile record.
6. Profile completion scoring.
7. Trust score calculation.
8. Verification document upload records.
9. Soft trust badges.
10. Taxonomy-powered industry navigation.

## Seller Gate Strategy

During development:

- allow listing creation at Tier 0
- allow RFQ visibility at Tier 0
- show trust nudges on seller dashboard
- boost higher tiers without hiding lower tiers
- show only minimal trust chips on supplier cards during the first wiring pass

Later:

- premium RFQ access can require Tier 2
- featured ranking can require Tier 2
- verified badge can require Tier 3
- trusted supplier placement can require Tier 4

## Procurement Gate Strategy

Procurement actions should use trust-aware progressive gates:

- publish RFQ
- contact supplier
- submit quote
- access premium RFQ
- qualify for featured visibility

During development mode:

- return warnings and improvement prompts
- allow continued testing where possible
- avoid hard enforcement by default

Later:

- premium RFQs can require stronger buyer identity
- quote submission can require verified supplier milestones
- featured visibility can require higher trust tiers

## Internal Operations Roles

Do not keep verification workflow admin-only.

Introduce `supplier_success` as a separate internal role for:

- supplier onboarding review
- document verification workflow
- trust recommendations
- supplier quality improvement

This keeps `admin` focused on governance and platform control rather than day-to-day supplier operations.

Use a separate ops queue surface for `supplier_success`, not the normal user notification stream.

The first internal operational surface should prioritize:

- verification backlog
- recently submitted suppliers
- supplier follow-up tasks

Avoid broad internal menu sprawl until real operational patterns demand it.

## Buyer Gate Strategy

During development:

- allow buyer registration with lightweight information
- allow browsing and saved suppliers
- allow RFQ drafts with incomplete profiles
- nudge phone and business verification

Later:

- live RFQ publishing can require verified email and business basics
- high-value RFQs can require stronger company identity
- supplier contact limits can depend on buyer profile maturity

## Migration Rules

Use non-destructive migrations only.

- Add nullable columns first.
- Create profile shells for legacy users.
- Never force-reset sessions.
- Never make existing profile fields suddenly mandatory.
- Never hide old suppliers as a migration side effect.
- Add enforcement only after UI prompts, analytics, and grace periods exist.

## Trust Ranking Rule

Trust is a boost, not a visibility switch.

Recommended ranking composition:

- trust score
- listing quality
- response behavior
- RFQ success
- recency
- engagement
- supplier activity

Low-trust suppliers remain visible unless they are explicitly suspended by moderation.

## Badge Rule

Badges should represent separate credibility signals:

- New Supplier
- Email Verified
- Business Profile Complete
- Verified Business
- Trusted Supplier

Avoid one oversized badge that claims more certainty than the platform has actually verified.

`Business Profile Complete` is private/internal. It should appear in dashboards, onboarding, profile completion trackers, and supplier settings. It should not appear as a public marketplace trust chip.

Public marketplace trust chips should be scarce:

- Verified Supplier
- Trusted Supplier

Email Verified may be shown only as a temporary early-stage light signal when explicitly enabled.

## Trust Rendering Hierarchy

Use progressive trust disclosure:

- product cards: one compact supplier trust chip only, reserved for verified/trusted states
- supplier cards: minimal public verified/trusted chip in pass 1, expanded signals later
- supplier profiles: full trust breakdown, certifications, response metrics, verification history
- dashboards: supplier improvement prompts and private trust analytics

The first buyer-facing trust pass should answer whether MetalHub feels state-aware and trust-aware, not expose every trust metric.

## Onboarding State Ownership

Draft onboarding state belongs in `onboarding_sessions`.

Committed marketplace identity belongs in:

- `profiles`
- `companies`
- `seller_profiles`
- `buyer_profiles`

Only move onboarding draft data into committed profile tables after validation, confirmation, or completion checkpoints.

`onboarding_sessions` should keep exactly one active draft per user, role, flow key, and flow version. Older completed, abandoned, or archived sessions remain available for analytics and recovery.

Skipped steps persist and store:

- skipped timestamp
- skip reason
- last nudged timestamp
- nudge count

Skips should create progressive trust pressure through nudges and unlocks, not forced interruption.

## UX Copy

Use progression language:

- Complete your company profile to improve buyer trust.
- Add business documents to unlock verified supplier status.
- Improve response rate to increase RFQ visibility.
- Add media-rich listings to increase buyer confidence.

Avoid punitive language during development:

- You are blocked.
- You cannot continue.
- Upload documents before proceeding.

## Production Readiness Checklist

Before disabling development trust mode:

- auth persistence verified on refresh
- role-aware redirects verified
- onboarding incomplete redirects verified
- profile shell creation tested
- trust score calculation tested
- profile completion scoring tested
- seller listing creation tested for all trust tiers
- RFQ flows tested for buyer and seller roles
- document upload security reviewed
- audit logs recording sensitive actions
- email logs recording auth/security emails
- rollback plan prepared

## Industry Registry Rule

Industry navigation, homepage discovery, marketplace filters, onboarding forms, RFQ forms, and listing forms should consume the central `taxonomy` registry.

Do not add new hardcoded industry arrays.

Use `/industries/[slug]` for industry landing routes.
