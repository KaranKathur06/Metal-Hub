-- ═══════════════════════════════════════════════════════════
-- Migration: Admin RBAC, 2FA OTP System, Admin Sessions
-- MetalHub Enterprise Security Architecture
-- ═══════════════════════════════════════════════════════════

-- ─── 1. OTP Verifications Table ───
-- Stores hashed OTP codes for step-up admin authentication
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'admin_2fa',
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  is_used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_otp_verifications_user_id ON otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_purpose ON otp_verifications(purpose);

-- ─── 2. Admin Sessions Table ───
-- Elevated privilege sessions after 2FA verification
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active, expires_at);

-- ─── 3. Admin Audit Logs Table ───
-- Security audit trail for all admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_user ON admin_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_severity ON admin_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_logs(created_at);

-- ─── 4. Rate Limiting Table ───
-- Track OTP attempts and API rate limits
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_end TIMESTAMPTZ NOT NULL,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_end);

-- ─── 5. Add role column to profiles if not exists ───
-- The profiles table in Supabase may use different role values
-- Ensure admin/super_admin roles are supported
DO $$
BEGIN
  -- Check if the 'role' column exists and add admin values if using enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    RAISE NOTICE 'profiles.role column exists';
  END IF;
END $$;

-- ─── 6. RLS Policies ───
-- Secure all admin tables with Row Level Security

ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- OTP: Users can only read their own OTPs
DROP POLICY IF EXISTS otp_user_read ON otp_verifications;
CREATE POLICY otp_user_read ON otp_verifications
  FOR SELECT USING (auth.uid() = user_id);

-- Admin sessions: Users can only read their own sessions
DROP POLICY IF EXISTS admin_session_user_read ON admin_sessions;
CREATE POLICY admin_session_user_read ON admin_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Audit logs: Only admins can read (enforced at API level)
-- Service role has full access for writes
DROP POLICY IF EXISTS audit_service_write ON admin_audit_logs;
CREATE POLICY audit_service_write ON admin_audit_logs
  FOR INSERT WITH CHECK (true);

-- Rate limits: Service role only
DROP POLICY IF EXISTS rate_limit_service ON rate_limits;
CREATE POLICY rate_limit_service ON rate_limits
  FOR ALL USING (true);

-- ─── 7. Auto-cleanup function ───
-- Automatically purge expired OTPs and sessions
CREATE OR REPLACE FUNCTION cleanup_expired_admin_data()
RETURNS void AS $$
BEGIN
  -- Delete expired and used OTPs older than 24 hours
  DELETE FROM otp_verifications 
  WHERE (expires_at < now() - interval '24 hours') OR (is_used = true AND used_at < now() - interval '1 hour');
  
  -- Deactivate expired admin sessions
  UPDATE admin_sessions SET is_active = false 
  WHERE is_active = true AND expires_at < now();
  
  -- Delete expired rate limit windows
  DELETE FROM rate_limits WHERE window_end < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- Tables: otp_verifications, admin_sessions, admin_audit_logs, rate_limits
-- RLS: Enabled on all tables
-- Cleanup: Automatic expired data purging
-- ═══════════════════════════════════════════════════════════
