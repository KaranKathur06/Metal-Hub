/**
 * Metal Hub — Email Service
 *
 * Centralized email delivery service.
 * Supports Resend (primary) and console fallback (development).
 *
 * Environment:
 *   RESEND_API_KEY     → Resend API key (prod)
 *   EMAIL_FROM_ADDRESS → Sender address (default: noreply@metalhub.in)
 *   EMAIL_FROM_NAME    → Sender name (default: Metal Hub)
 */

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type SendResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@metalhub.in';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Metal Hub';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * Send email via configured provider.
 * Falls back to console logging in development.
 */
export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  // Resend integration
  if (RESEND_API_KEY) {
    return sendViaResend(payload);
  }

  // Development fallback: log to console
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 EMAIL (dev mode — no RESEND_API_KEY set)`);
  console.log(`   To:      ${payload.to}`);
  console.log(`   Subject: ${payload.subject}`);
  console.log(`   Body:    ${payload.text || '(HTML only)'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return { success: true, messageId: `dev-${Date.now()}` };
}

async function sendViaResend(payload: EmailPayload): Promise<SendResult> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_ADDRESS}>`,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Email] Resend error:', data);
      return { success: false, error: data?.message || 'Resend API error' };
    }

    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error('[Email] Send failed:', err);
    return { success: false, error: err.message };
  }
}

// ── Email Templates ──

export function otpEmailTemplate(code: string, expiryMinutes: number): { subject: string; html: string; text: string } {
  return {
    subject: `${code} — Your Metal Hub verification code`,
    text: `Your Metal Hub verification code is: ${code}\n\nThis code expires in ${expiryMinutes} minutes.\n\nIf you didn't request this, please ignore this email.`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <tr>
      <td style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);padding:24px 32px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px">🔐 Metal Hub</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px">
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">
          Here&rsquo;s your verification code for admin access:
        </p>
        <div style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:8px;padding:20px;text-align:center;margin:0 0 16px">
          <span style="font-size:32px;font-weight:800;letter-spacing:6px;color:#1e3a8a;font-family:monospace">${code}</span>
        </div>
        <p style="margin:0 0 8px;color:#94a3b8;font-size:12px">
          This code expires in <strong>${expiryMinutes} minutes</strong>.
        </p>
        <p style="margin:0;color:#94a3b8;font-size:12px">
          If you didn&rsquo;t request this code, you can safely ignore this email. Someone may have entered your email by mistake.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="margin:0;color:#94a3b8;font-size:11px">Metal Hub — India&rsquo;s Premier B2B Metal Marketplace</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

export function verificationEmailTemplate(userName: string, status: 'approved' | 'rejected', notes?: string): { subject: string; html: string; text: string } {
  const isApproved = status === 'approved';
  return {
    subject: isApproved ? '✅ Your Metal Hub seller account is verified!' : '⚠️ Metal Hub verification update',
    text: isApproved
      ? `Hi ${userName}, your seller account has been verified! You can now create listings on Metal Hub.`
      : `Hi ${userName}, your seller verification needs attention. ${notes || 'Please review and resubmit.'}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <tr>
      <td style="background:linear-gradient(135deg,${isApproved ? '#16a34a,#22c55e' : '#f59e0b,#eab308'});padding:24px 32px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">${isApproved ? '✅ Verified!' : '⚠️ Action Required'}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px">
        <p style="margin:0 0 16px;color:#1e293b;font-size:15px;font-weight:600">Hi ${userName},</p>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">
          ${isApproved
            ? 'Your seller account has been verified! You can now create product listings and connect with buyers on Metal Hub.'
            : `Your seller verification needs attention. ${notes || 'Please review your submission and update any missing information.'}`}
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://metalhub.in'}/${isApproved ? 'seller/dashboard' : 'settings'}"
           style="display:inline-block;background:${isApproved ? '#1e3a8a' : '#f59e0b'};color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600">
          ${isApproved ? 'Go to Dashboard →' : 'Review Submission →'}
        </a>
      </td>
    </tr>
    <tr>
      <td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="margin:0;color:#94a3b8;font-size:11px">Metal Hub — India&rsquo;s Premier B2B Metal Marketplace</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

export function suspensionEmailTemplate(userName: string, action: 'suspend' | 'unsuspend', reason?: string): { subject: string; html: string; text: string } {
  const isSuspended = action === 'suspend';
  return {
    subject: isSuspended ? '🚫 Your Metal Hub account has been suspended' : '✅ Your Metal Hub account has been restored',
    text: isSuspended
      ? `Hi ${userName}, your account has been suspended. ${reason || 'Contact support for details.'}`
      : `Hi ${userName}, your account has been restored. You can now access all features.`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <tr>
      <td style="background:${isSuspended ? '#dc2626' : '#16a34a'};padding:24px 32px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">${isSuspended ? '🚫 Account Suspended' : '✅ Account Restored'}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px">
        <p style="margin:0 0 16px;color:#1e293b;font-size:15px;font-weight:600">Hi ${userName},</p>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">
          ${isSuspended
            ? `Your Metal Hub account has been suspended. ${reason ? `Reason: ${reason}` : ''} If you believe this is an error, please contact our support team.`
            : 'Great news! Your Metal Hub account has been restored. You can now access all marketplace features again.'}
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="margin:0;color:#94a3b8;font-size:11px">Metal Hub — India&rsquo;s Premier B2B Metal Marketplace</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}
