/**
 * Structured auth diagnostics (enable with AUTH_DEBUG=true).
 */

const ENABLED =
  process.env.AUTH_DEBUG === "true" || process.env.NODE_ENV === "development";

type AuthLogContext = Record<string, unknown>;

export function authLog(phase: string, message: string, context?: AuthLogContext) {
  if (!ENABLED) return;
  console.info(
    JSON.stringify({
      scope: "metalhub.auth",
      phase,
      message,
      ts: new Date().toISOString(),
      ...context,
    }),
  );
}

export function authWarn(phase: string, message: string, context?: AuthLogContext) {
  console.warn(
    JSON.stringify({
      scope: "metalhub.auth",
      level: "warn",
      phase,
      message,
      ts: new Date().toISOString(),
      ...context,
    }),
  );
}
