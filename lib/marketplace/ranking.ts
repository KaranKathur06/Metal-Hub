// src/lib/marketplace/ranking.ts
import type { MarketplaceCertification, MarketplaceSettings, SupplierSearchResult } from "./types";

export const DEFAULT_MARKETPLACE_SETTINGS: MarketplaceSettings = {
    id: "default",
    version_name: "Default Marketplace Ranking",
    status: "active",
    seeded_supplier_weight: 0.7,
    seeded_rfq_weight: 0.7,
    real_supplier_boost: 1.5,
    real_rfq_boost: 1.5,
    exact_phrase_boost: 15,
    capability_weight: 10,
    product_weight: 9,
    certification_weight: 6,
    verification_weight: 5,
    activity_weight: 4,
    profile_completeness_weight: 3,
    interaction_weight: 3,
    location_weight: 2,
    supplier_name_weight: 1.5,
    seed_decay_threshold: 100,
    seed_visibility_decay_rate: 0.015,
    minimum_real_threshold: 25,
    maximum_seed_visibility: 100,
};

export function getSeededSupplierMultiplier(params: {
    isSeeded: boolean;
    realSupplierCount: number;
    settings: MarketplaceSettings;
}) {
    if (!params.isSeeded) return params.settings.real_supplier_boost;

    if (params.realSupplierCount < params.settings.minimum_real_threshold) {
        return params.settings.seeded_supplier_weight;
    }

    const decayBase = params.realSupplierCount - params.settings.minimum_real_threshold;
    const decayed = params.settings.seeded_supplier_weight - decayBase * params.settings.seed_visibility_decay_rate;
    const minimumVisibility = params.settings.maximum_seed_visibility / 100;

    return Math.max(Math.min(decayed, params.settings.seeded_supplier_weight), minimumVisibility * 0.1);
}

export function isCertificationActive(certification: MarketplaceCertification) {
    if (certification.verification_status !== "active") return false;
    if (!certification.expires_at) return true;

    const expiryTime = new Date(certification.expires_at).getTime();
    return Number.isFinite(expiryTime) && expiryTime >= Date.now();
}

export function getCertificationDisplayWeight(certification: MarketplaceCertification) {
    const active = isCertificationActive(certification);
    const verifiedWeight = active ? 1000 : 0;
    const pendingWeight =
        certification.verification_status === "pending_verification" ||
            certification.verification_status === "under_review"
            ? 100
            : 0;
    const expiredWeight = certification.verification_status === "expired" ? 25 : 0;

    return (
        verifiedWeight +
        pendingWeight +
        expiredWeight +
        certification.business_priority * 2 +
        certification.global_recognition_level
    );
}

export function sortCertificationsForCard(certifications: MarketplaceCertification[]) {
    return [...certifications]
        .filter(isCertificationActive)
        .sort((a, b) => getCertificationDisplayWeight(b) - getCertificationDisplayWeight(a));
}

export function splitCertificationsByLifecycle(certifications: MarketplaceCertification[]) {
    return {
        active: certifications.filter(isCertificationActive),
        pending: certifications.filter(
            (certification) =>
                certification.verification_status === "pending_verification" ||
                certification.verification_status === "under_review",
        ),
        expired: certifications.filter((certification) => certification.verification_status === "expired"),
        revoked: certifications.filter((certification) => certification.verification_status === "revoked"),
        rejected: certifications.filter((certification) => certification.verification_status === "rejected"),
        suspended: certifications.filter((certification) => certification.verification_status === "suspended"),
    };
}

export type SupplierCertificationSummary = {
    name: string;
    slug: string;
    status?: string;
    expires_at?: string | null;
    business_priority?: number;
    global_recognition_level?: number;
};

export function getVisibleCertificationBadges(
    certifications: SupplierCertificationSummary[],
    limit = 3,
) {
    const sorted = [...certifications].sort((a, b) => {
        const aWeight =
            (a.business_priority ?? 0) * 2 + (a.global_recognition_level ?? 0);
        const bWeight =
            (b.business_priority ?? 0) * 2 + (b.global_recognition_level ?? 0);
        return bWeight - aWeight || a.name.localeCompare(b.name);
    });

    return {
        visible: sorted.slice(0, limit),
        overflow: sorted.slice(limit),
        overflowCount: Math.max(0, sorted.length - limit),
    };
}

export function computeClientSideSupplierScore(params: {
    supplier: SupplierSearchResult;
    realSupplierCount: number;
    settings: MarketplaceSettings;
}) {
    const { supplier, settings } = params;
    const seedMultiplier = getSeededSupplierMultiplier({
        isSeeded: supplier.is_seeded,
        realSupplierCount: params.realSupplierCount,
        settings,
    });

    const verificationScore = supplier.verification_status === "verified" ? settings.verification_weight : 0;
    const profileScore = (supplier.profile_completeness / 100) * settings.profile_completeness_weight;
    const interactionScore = Math.log1p(supplier.interaction_count) * settings.interaction_weight;

    return (
        (supplier.match_score +
            supplier.supplier_rank_score +
            verificationScore +
            profileScore +
            interactionScore) *
        seedMultiplier
    );
}