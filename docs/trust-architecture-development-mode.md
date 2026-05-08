# MetalHub Trust Architecture: Development Mode

## Operating Principle

MetalHub is currently in controlled ecosystem shaping mode, not strict compliance enforcement mode.

The platform should feel enterprise-grade, collect trust signals, and support future enforcement without blocking testers, early suppliers, or marketplace liquidity.

## Strategic Decisions

### 1. Seller Trust Comes First

Seller quality is the primary trust driver in an industrial procurement marketplace.

Phase 1 should prioritize:

- email verification
- company profile completion
- business verification readiness
- factory and document evidence collection
- seller trust badges
- listing quality signals
- role-aware navigation and onboarding state

Buyer onboarding should remain lighter during early development so RFQ demand can grow without excessive friction.

### 2. Use Progressive Trust Gates

Do not hard-block existing or early users during development.

Use progressive nudges, visibility boosts, and premium unlocks instead of immediate restrictions.

Hard enforcement should be introduced later behind feature flags and grace periods.

### 3. Use Soft Trust Weighting

Low-trust suppliers should remain visible.

Trust should influence ranking through boosts, not exclusion.

Recommended ranking inputs:

- trust score
- activity score
- response score
- listing quality
- RFQ success
- freshness
- engagement

Trust should boost quality suppliers while preserving marketplace density.

## Trust Tiers

### Tier 0: New Supplier

Requirements:

- account created

Capabilities:

- browse marketplace
- create profile
- create listings
- receive baseline visibility

Badge:

- New Supplier

### Tier 1: Email Verified

Requirements:

- verified email

Capabilities:

- small ranking boost
- clearer buyer-facing trust indicator

Badge:

- Email Verified

### Tier 2: Business Profile Complete

Requirements:

- company details
- business address
- industry selection
- profile media where available

Capabilities:

- moderate ranking boost
- stronger marketplace visibility

Badge:

- Business Profile Complete

### Tier 3: Document Verified

Requirements:

- submitted business documents
- admin-reviewed or review-ready verification status

Capabilities:

- stronger ranking boost
- buyer-facing verification badge

Badge:

- Verified Business

### Tier 4: Trusted Supplier

Requirements:

- strong responsiveness
- successful quote activity
- mature profile
- positive marketplace engagement

Capabilities:

- premium ranking boost
- eligibility for featured placements
- stronger procurement credibility indicators

Badge:

- Trusted Supplier

## Hybrid Trust Engine

Trust must be multi-signal, not document-only.

Recommended signal weights:

- identity signals: 15%
- business signals: 25%
- profile quality signals: 15%
- behavior signals: 25%
- marketplace performance signals: 20%

Identity signals include email verification, phone verification, domain email, LinkedIn, and company website.

Business signals include GST, certifications, company registration, export license, and factory evidence.

Profile quality signals include detailed descriptions, media uploads, catalogs, factory images, production capabilities, and category coverage.

Behavior signals include response rate, RFQ replies, quote quality, login consistency, and recent activity.

Marketplace performance signals include buyer feedback, repeat interactions, quote acceptance, and engagement quality.

## Migration Strategy

Use non-destructive progressive migration.

### Phase 1: Backward Compatibility

All new trust, onboarding, verification, taxonomy, and profile fields should be nullable or optional during development.

Avoid immediate `NOT NULL` constraints for fields that existing users do not already have.

### Phase 2: Profile Normalization

Introduce a profile migration service that:

- maps legacy roles
- creates missing profile shells
- generates missing slugs
- assigns default onboarding state
- assigns default trust level
- initializes verification status

Recommended defaults:

- `profile_status = incomplete`
- `trust_level = 0`
- `onboarding_step = 1`
- `verification_status = pending`

### Phase 3: Soft Prompts

Use banners, profile meters, dashboard cards, trust recommendations, and onboarding prompts.

Example message:

`Your profile is 45% complete. Complete business details to improve RFQ visibility.`

### Phase 4: Limited Feature Gating

Later, introduce selective gates:

- premium RFQs require verified profile
- featured ranking requires completed business profile
- top visibility requires trust score threshold

Do not freeze existing users overnight.

Use grace periods before enforcing business-critical restrictions.

## Development Trust Mode

Add a platform-level development mode for trust enforcement.

Recommended flag:

`development_trust_mode = true`

When enabled, the platform should:

- bypass hard trust blocks
- allow incomplete profiles
- allow test accounts
- allow draft verification states
- simulate trust tiers
- collect trust signals
- render badges and profile scores
- keep onboarding flows testable

When disabled, production enforcement can progressively activate through feature flags.

## UI Rules

Trust friction should be framed as status progression, not punishment.

Use language like:

- Improve buyer trust
- Unlock higher visibility
- Increase RFQ win rate
- Become a verified supplier

Avoid language like:

- Upload GST before continuing
- You are blocked
- You cannot proceed

## Public vs Private Trust Signals

Public marketplace badges must remain scarce.

Use public badges for:

- Verified Supplier
- Trusted Supplier

Use private/internal progress labels for:

- Business Profile Complete
- Profile completion percentage
- Missing sections
- Improvement recommendations

Profile completion motivates suppliers, but it does not prove marketplace reliability. Keep it inside onboarding, dashboards, and supplier settings.

## Onboarding Session Ownership

Draft onboarding state belongs in `onboarding_sessions`, not committed profile tables.

Use exactly one active draft per:

- user
- role
- flow key
- flow version

Allowed lifecycle states:

- active
- completed
- abandoned
- archived

Skipped steps should remain skipped and store nudge metadata. Do not reopen skipped steps aggressively during development mode.

## Implementation Order

1. Auth state and session stability
2. Role-aware navigation
3. Seller profile and trust state model
4. Profile completion engine
5. Verification document collection
6. Soft trust badges and ranking boosts
7. Typed taxonomy registry
8. Location hierarchy
9. Listing media system
10. RFQ and quote intelligence

## Non-Negotiables

- Preserve early marketplace liquidity.
- Keep all trust fields backward-compatible during development.
- Use weighted ranking, not supplier hiding.
- Use hybrid trust, not document-only verification.
- Never force-reset existing user state.
- Gate strict enforcement behind configuration and grace periods.
