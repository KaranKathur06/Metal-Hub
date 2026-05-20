-- Fix admin 2FA OTP flow: RLS was SELECT-only on otp_verifications / admin_sessions.
-- Authenticated admins must insert and update their own rows.

-- otp_verifications: read + write own rows
DROP POLICY IF EXISTS otp_user_insert ON public.otp_verifications;
CREATE POLICY otp_user_insert ON public.otp_verifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS otp_user_update ON public.otp_verifications;
CREATE POLICY otp_user_update ON public.otp_verifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- admin_sessions: create and read own sessions
DROP POLICY IF EXISTS admin_session_user_insert ON public.admin_sessions;
CREATE POLICY admin_session_user_insert ON public.admin_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS admin_session_user_update ON public.admin_sessions;
CREATE POLICY admin_session_user_update ON public.admin_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- rate_limits: authenticated users (OTP + API rate limiting)
DROP POLICY IF EXISTS rate_limit_service ON public.rate_limits;
DROP POLICY IF EXISTS rate_limit_authenticated ON public.rate_limits;
CREATE POLICY rate_limit_authenticated ON public.rate_limits
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- audit logs: authenticated may insert own audit rows
DROP POLICY IF EXISTS audit_service_write ON public.admin_audit_logs;
DROP POLICY IF EXISTS audit_user_insert ON public.admin_audit_logs;
CREATE POLICY audit_user_insert ON public.admin_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.otp_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.admin_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.rate_limits TO authenticated;
GRANT SELECT, INSERT ON public.admin_audit_logs TO authenticated;
