import type { AuthEmailTemplateKey } from "./auth-email-templates";

export type EmailLogStatus = "queued" | "sent" | "failed";

export function createQueuedEmailLog(input: {
  profileId?: string | null;
  emailTo: string;
  templateKey: AuthEmailTemplateKey;
  subject: string;
  provider?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return {
    profile_id: input.profileId ?? null,
    email_to: input.emailTo,
    template_key: input.templateKey,
    subject: input.subject,
    provider: input.provider ?? null,
    status: "queued" satisfies EmailLogStatus,
    metadata: input.metadata ?? {},
  };
}

export function createSentEmailLogPatch(input: {
  provider?: string | null;
  providerMessageId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return {
    provider: input.provider ?? null,
    provider_message_id: input.providerMessageId ?? null,
    status: "sent" satisfies EmailLogStatus,
    metadata: input.metadata ?? {},
    sent_at: new Date().toISOString(),
  };
}

export function createFailedEmailLogPatch(input: {
  provider?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return {
    provider: input.provider ?? null,
    status: "failed" satisfies EmailLogStatus,
    metadata: input.metadata ?? {},
  };
}

