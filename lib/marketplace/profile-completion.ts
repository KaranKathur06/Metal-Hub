export type ProfileCompletionSection = {
  key: string;
  label: string;
  requiredFields: string[];
  recommendedFields?: string[];
  weight: number;
};

export type ProfileCompletionResult = {
  overallPercent: number;
  sections: Array<{
    key: string;
    label: string;
    percent: number;
    missingFields: string[];
    recommendations: string[];
  }>;
};

export const SELLER_PROFILE_COMPLETION_SECTIONS: ProfileCompletionSection[] = [
  {
    key: "business_details",
    label: "Business Details",
    requiredFields: ["companyName", "businessType", "industryId", "businessAddress"],
    recommendedFields: ["website", "linkedinUrl", "companySize", "yearsInBusiness"],
    weight: 25,
  },
  {
    key: "verification",
    label: "Verification",
    requiredFields: ["emailVerified"],
    recommendedFields: ["gstNumber", "panNumber", "gstCertificateUrl", "companyRegistrationUrl"],
    weight: 25,
  },
  {
    key: "factory_details",
    label: "Factory Details",
    requiredFields: ["countryId", "stateId", "cityId"],
    recommendedFields: ["factoryAddress", "factoryPhotos", "annualProductionCapacity", "exportCapability"],
    weight: 20,
  },
  {
    key: "certifications",
    label: "Certifications",
    requiredFields: [],
    recommendedFields: ["certifications", "isoCertificateUrl", "productCatalogUrl"],
    weight: 15,
  },
  {
    key: "marketplace_readiness",
    label: "Marketplace Readiness",
    requiredFields: ["profileImageUrl"],
    recommendedFields: ["bannerUrl", "listingCount", "primaryListingImage"],
    weight: 15,
  },
];

export const BUYER_PROFILE_COMPLETION_SECTIONS: ProfileCompletionSection[] = [
  {
    key: "identity",
    label: "Company Identity",
    requiredFields: ["companyName", "emailVerified"],
    recommendedFields: ["phoneVerified", "website"],
    weight: 35,
  },
  {
    key: "procurement_profile",
    label: "Procurement Profile",
    requiredFields: ["procurementCategoryId"],
    recommendedFields: ["annualProcurementVolume", "requirementsSummary"],
    weight: 35,
  },
  {
    key: "business_information",
    label: "Business Information",
    requiredFields: ["businessType", "countryId", "stateId", "cityId"],
    recommendedFields: ["gstNumber", "panNumber"],
    weight: 30,
  },
];

function hasValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined && value !== false;
}

export function calculateProfileCompletion(
  profile: Record<string, unknown>,
  sections: ProfileCompletionSection[],
): ProfileCompletionResult {
  const normalizedWeight = sections.reduce((total, section) => total + section.weight, 0) || 1;

  const completedSections = sections.map((section) => {
    const recommendedFields = section.recommendedFields ?? [];
    const allFields = [...section.requiredFields, ...recommendedFields];
    const completedFields = allFields.filter((field) => hasValue(profile[field]));
    const missingFields = section.requiredFields.filter((field) => !hasValue(profile[field]));
    const recommendations = recommendedFields.filter((field) => !hasValue(profile[field]));
    const percent = allFields.length === 0 ? 100 : Math.round((completedFields.length / allFields.length) * 100);

    return {
      key: section.key,
      label: section.label,
      percent,
      missingFields,
      recommendations,
      weightedPercent: percent * (section.weight / normalizedWeight),
    };
  });

  const overallPercent = Math.round(
    completedSections.reduce((total, section) => total + section.weightedPercent, 0),
  );

  return {
    overallPercent,
    sections: completedSections.map(({ weightedPercent: _weightedPercent, ...section }) => section),
  };
}
