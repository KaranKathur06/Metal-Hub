export type AuthEmailTemplateKey =
  | "confirm_signup_otp"
  | "welcome"
  | "forgot_password"
  | "password_changed"
  | "email_changed"
  | "phone_changed"
  | "identity_linked"
  | "identity_unlinked"
  | "mfa_added"
  | "mfa_removed";

export type AuthEmailTemplateDefinition = {
  key: AuthEmailTemplateKey;
  subject: string;
  preheader: string;
  ctaLabel: string;
  securityNotice: string;
};

export const AUTH_EMAIL_TEMPLATES: Record<AuthEmailTemplateKey, AuthEmailTemplateDefinition> = {
  confirm_signup_otp: {
    key: "confirm_signup_otp",
    subject: "Verify Your MetalHub Account",
    preheader: "Use this one-time code to verify your MetalHub account.",
    ctaLabel: "Verify account",
    securityNotice: "This code expires soon. Do not share it with anyone.",
  },
  welcome: {
    key: "welcome",
    subject: "Welcome to MetalHub - India's Industrial Procurement Network",
    preheader: "Your supplier network and procurement workspace is ready.",
    ctaLabel: "Open MetalHub",
    securityNotice: "Review your company profile and security settings before inviting teammates.",
  },
  forgot_password: {
    key: "forgot_password",
    subject: "Reset Your Password Securely",
    preheader: "Use this secure link to reset your MetalHub password.",
    ctaLabel: "Reset password",
    securityNotice: "If you did not request a reset, secure your account immediately.",
  },
  password_changed: {
    key: "password_changed",
    subject: "Your MetalHub Password Was Changed",
    preheader: "This is a security confirmation for your account.",
    ctaLabel: "Review account",
    securityNotice: "If you did not make this change, rotate credentials and review active sessions.",
  },
  email_changed: {
    key: "email_changed",
    subject: "Your Email Address Was Updated",
    preheader: "Your MetalHub sign-in email has changed.",
    ctaLabel: "Review account",
    securityNotice: "If you did not authorize this change, investigate immediately.",
  },
  phone_changed: {
    key: "phone_changed",
    subject: "Your Phone Number Was Updated",
    preheader: "Your MetalHub phone number has been changed.",
    ctaLabel: "Review account",
    securityNotice: "If you did not authorize this change, review account security.",
  },
  identity_linked: {
    key: "identity_linked",
    subject: "New Login Method Added",
    preheader: "A new identity provider was linked to your MetalHub account.",
    ctaLabel: "Review account",
    securityNotice: "Only keep sign-in methods you recognize and actively use.",
  },
  identity_unlinked: {
    key: "identity_unlinked",
    subject: "Login Method Removed",
    preheader: "A login identity was removed from your MetalHub account.",
    ctaLabel: "Review account",
    securityNotice: "Confirm your remaining sign-in methods still allow secure account access.",
  },
  mfa_added: {
    key: "mfa_added",
    subject: "Multi-Factor Authentication Enabled",
    preheader: "Additional account protection is now active.",
    ctaLabel: "Review security",
    securityNotice: "Store backup access methods securely and review active sessions.",
  },
  mfa_removed: {
    key: "mfa_removed",
    subject: "Multi-Factor Authentication Disabled",
    preheader: "A critical account security control was removed.",
    ctaLabel: "Review security",
    securityNotice: "If you did not authorize this change, restore MFA immediately and review recent activity.",
  },
};

export function getAuthEmailTemplate(key: AuthEmailTemplateKey) {
  return AUTH_EMAIL_TEMPLATES[key];
}

