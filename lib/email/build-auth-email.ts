import { getAuthEmailTemplate, type AuthEmailTemplateKey } from "./auth-email-templates";

export type AuthEmailRenderInput = {
  templateKey: AuthEmailTemplateKey;
  recipientName?: string | null;
  otpCode?: string | null;
  ctaUrl?: string | null;
  ctaLabel?: string | null;
  supportEmail?: string | null;
  deviceInfo?: string | null;
  ipAddress?: string | null;
  locationLabel?: string | null;
  expiryNotice?: string | null;
  bodyLines: string[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderDeviceMeta(input: AuthEmailRenderInput) {
  const items = [
    input.deviceInfo ? `Device: ${input.deviceInfo}` : null,
    input.ipAddress ? `IP: ${input.ipAddress}` : null,
    input.locationLabel ? `Location: ${input.locationLabel}` : null,
  ].filter(Boolean);

  if (!items.length) {
    return "";
  }

  return `
    <div style="margin-top:16px;padding:12px;border-radius:10px;background:#f4f4f5;color:#3f3f46;font-size:13px;line-height:1.6;">
      ${items.map((item) => `<div>${escapeHtml(item!)}</div>`).join("")}
    </div>
  `;
}

export function buildAuthEmail(input: AuthEmailRenderInput) {
  const template = getAuthEmailTemplate(input.templateKey);
  const ctaLabel = input.ctaLabel ?? template.ctaLabel;
  const greeting = input.recipientName ? `Hello ${escapeHtml(input.recipientName)},` : "Hello,";
  const bodyHtml = input.bodyLines.map((line) => `<p style="margin:0 0 12px;color:#27272a;font-size:15px;line-height:1.7;">${escapeHtml(line)}</p>`).join("");
  const otpHtml = input.otpCode
    ? `<div style="margin:20px 0;padding:16px;border-radius:12px;background:#18181b;color:#fafafa;text-align:center;font-size:28px;letter-spacing:8px;font-weight:700;">${escapeHtml(input.otpCode)}</div>`
    : "";
  const ctaHtml = input.ctaUrl
    ? `<a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;margin-top:12px;padding:12px 18px;border-radius:10px;background:#18181b;color:#ffffff;text-decoration:none;font-weight:600;">${escapeHtml(ctaLabel)}</a>`
    : "";
  const supportLine = input.supportEmail
    ? `Support: ${input.supportEmail}`
    : "Support: support@metalhub.example";
  const expiryLine = input.expiryNotice ?? "This message may expire for security reasons.";

  const html = `
<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f5f5f4;padding:24px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;">
      <tr>
        <td style="padding:24px 28px;background:linear-gradient(135deg,#1c1917,#44403c);color:#fafaf9;">
          <div style="font-size:22px;font-weight:700;letter-spacing:0.3px;">MetalHub</div>
          <div style="margin-top:6px;font-size:13px;color:#d6d3d1;">Industrial procurement network</div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          <div style="font-size:13px;color:#71717a;margin-bottom:10px;">${escapeHtml(template.preheader)}</div>
          <p style="margin:0 0 16px;color:#18181b;font-size:15px;line-height:1.7;">${greeting}</p>
          ${bodyHtml}
          ${otpHtml}
          ${ctaHtml}
          ${renderDeviceMeta(input)}
          <div style="margin-top:20px;padding:14px;border-radius:12px;background:#fff7ed;color:#9a3412;font-size:13px;line-height:1.6;">
            <strong>Security notice:</strong> ${escapeHtml(template.securityNotice)}
          </div>
          <div style="margin-top:12px;font-size:12px;color:#71717a;line-height:1.6;">
            <div>${escapeHtml(expiryLine)}</div>
            <div>${escapeHtml(supportLine)}</div>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();

  const text = [
    "MetalHub",
    template.subject,
    "",
    input.recipientName ? `Hello ${input.recipientName},` : "Hello,",
    "",
    ...input.bodyLines,
    input.otpCode ? "" : null,
    input.otpCode ? `Code: ${input.otpCode}` : null,
    input.ctaUrl ? `Action: ${ctaLabel} - ${input.ctaUrl}` : null,
    input.deviceInfo ? `Device: ${input.deviceInfo}` : null,
    input.ipAddress ? `IP: ${input.ipAddress}` : null,
    input.locationLabel ? `Location: ${input.locationLabel}` : null,
    "",
    `Security notice: ${template.securityNotice}`,
    input.expiryNotice ?? "This message may expire for security reasons.",
    input.supportEmail ? `Support: ${input.supportEmail}` : "Support: support@metalhub.example",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: template.subject,
    html,
    text,
    template,
  };
}

