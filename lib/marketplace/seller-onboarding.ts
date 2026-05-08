export type SellerOnboardingStepKey =
  | "account_setup"
  | "company_information"
  | "factory_capabilities"
  | "documents"
  | "first_listing"
  | "profile_enhancement";

export type SellerOnboardingStepStatus = "not_started" | "draft" | "complete" | "skipped";

export type SellerOnboardingStep = {
  key: SellerOnboardingStepKey;
  stepNumber: number;
  title: string;
  goal: string;
  requiredFields: string[];
  optionalFields: string[];
  skippableInDevelopment: boolean;
};

export type SellerOnboardingState = {
  currentStep: SellerOnboardingStepKey;
  completedSteps: SellerOnboardingStepKey[];
  skippedSteps: SellerOnboardingStepKey[];
  draftSteps: SellerOnboardingStepKey[];
};

export const SELLER_ONBOARDING_STEPS: SellerOnboardingStep[] = [
  {
    key: "account_setup",
    stepNumber: 1,
    title: "Account Setup",
    goal: "Create a low-friction supplier identity.",
    requiredFields: ["fullName", "email", "role"],
    optionalFields: ["phone"],
    skippableInDevelopment: false,
  },
  {
    key: "company_information",
    stepNumber: 2,
    title: "Company Information",
    goal: "Establish the business identity buyers will evaluate.",
    requiredFields: ["companyName", "businessType", "industryId", "countryId", "stateId", "cityId"],
    optionalFields: ["website", "linkedinUrl", "companySize", "yearsInBusiness"],
    skippableInDevelopment: true,
  },
  {
    key: "factory_capabilities",
    stepNumber: 3,
    title: "Factory & Capabilities",
    goal: "Show operational seriousness and production capability.",
    requiredFields: ["productionCapacity"],
    optionalFields: ["machinery", "manufacturingProcesses", "certifications", "exportCapability"],
    skippableInDevelopment: true,
  },
  {
    key: "documents",
    stepNumber: 4,
    title: "Documents",
    goal: "Collect verification evidence without blocking development testing.",
    requiredFields: [],
    optionalFields: ["gstCertificateUrl", "isoCertificateUrl", "companyRegistrationUrl", "productCatalogUrl"],
    skippableInDevelopment: true,
  },
  {
    key: "first_listing",
    stepNumber: 5,
    title: "First Listing",
    goal: "Activate the supplier into marketplace inventory.",
    requiredFields: ["listingTitle", "listingCategoryId"],
    optionalFields: ["listingImages", "specifications", "moq", "leadTime"],
    skippableInDevelopment: true,
  },
  {
    key: "profile_enhancement",
    stepNumber: 6,
    title: "Profile Enhancement",
    goal: "Improve supplier credibility and buyer confidence.",
    requiredFields: [],
    optionalFields: ["bannerUrl", "factoryPhotos", "catalogs", "responseTarget"],
    skippableInDevelopment: true,
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

export function getStepStatus(
  step: SellerOnboardingStep,
  values: Record<string, unknown>,
  state?: Partial<SellerOnboardingState>,
): SellerOnboardingStepStatus {
  if (state?.completedSteps?.includes(step.key)) {
    return "complete";
  }

  if (state?.skippedSteps?.includes(step.key)) {
    return "skipped";
  }

  if (state?.draftSteps?.includes(step.key)) {
    return "draft";
  }

  const requiredComplete = step.requiredFields.every((field) => hasValue(values[field]));
  const anyFieldStarted = [...step.requiredFields, ...step.optionalFields].some((field) => hasValue(values[field]));

  if (requiredComplete) {
    return "complete";
  }

  if (anyFieldStarted) {
    return "draft";
  }

  return "not_started";
}

export function getSellerOnboardingProgress(
  values: Record<string, unknown>,
  state?: Partial<SellerOnboardingState>,
) {
  const steps = SELLER_ONBOARDING_STEPS.map((step) => ({
    ...step,
    status: getStepStatus(step, values, state),
  }));

  const completedCount = steps.filter((step) => step.status === "complete").length;
  const draftCount = steps.filter((step) => step.status === "draft").length;
  const skippedCount = steps.filter((step) => step.status === "skipped").length;
  const percent = Math.round((completedCount / steps.length) * 100);
  const currentStep =
    steps.find((step) => step.status === "draft") ??
    steps.find((step) => step.status === "not_started") ??
    steps[steps.length - 1];

  return {
    percent,
    completedCount,
    draftCount,
    skippedCount,
    currentStep,
    steps,
  };
}

export function canSkipSellerOnboardingStep(input: {
  step: SellerOnboardingStep;
  developmentTrustMode: boolean;
}) {
  return input.developmentTrustMode && input.step.skippableInDevelopment;
}

