export type AuditEntityType =
  | "profile"
  | "company"
  | "seller_profile"
  | "buyer_profile"
  | "verification_document"
  | "onboarding_session"
  | "rfq"
  | "quote"
  | "message_thread"
  | "auth"
  | "security"
  | "listing";

export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "verified"
  | "rejected"
  | "submitted"
  | "viewed"
  | "signed_in"
  | "signed_out"
  | "password_changed"
  | "email_changed"
  | "mfa_enabled"
  | "mfa_disabled"
  | "session_revoked";

export function createAuditLogEntry(input: {
  actorId?: string | null;
  entityType: AuditEntityType;
  entityId?: string | null;
  action: AuditAction;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return {
    actor_id: input.actorId ?? null,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    action: input.action,
    before_data: input.beforeData ?? null,
    after_data: input.afterData ?? null,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    metadata: input.metadata ?? {},
  };
}

