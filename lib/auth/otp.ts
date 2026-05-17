/**
 * Metal Hub — OTP Generation & Verification Utilities
 *
 * Uses cryptographically secure random generation and SHA-256 hashing.
 * OTPs are NEVER stored in plaintext — only hashes go to the database.
 */

import { createHash, randomBytes } from 'crypto';

const OTP_SALT = process.env.OTP_HASH_SALT || 'mh-otp-salt-change-in-production';
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
const OTP_MAX_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure numeric OTP.
 * Uses crypto.randomBytes instead of Math.random for security.
 */
export function generateOTP(length: number = OTP_LENGTH): string {
  const buffer = randomBytes(length);
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += (buffer[i] % 10).toString();
  }
  return otp;
}

/**
 * Hash an OTP using SHA-256 with a server-side salt.
 * This hash is what gets stored in the database.
 */
export function hashOTP(otp: string): string {
  return createHash('sha256')
    .update(otp + OTP_SALT)
    .digest('hex');
}

/**
 * Verify a submitted OTP against a stored hash.
 */
export function verifyOTPHash(submittedOTP: string, storedHash: string): boolean {
  const submittedHash = hashOTP(submittedOTP);
  // Constant-time comparison to prevent timing attacks
  if (submittedHash.length !== storedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < submittedHash.length; i++) {
    mismatch |= submittedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Calculate the OTP expiration timestamp.
 */
export function getOTPExpiry(minutes: number = OTP_EXPIRY_MINUTES): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
}

/**
 * Get the maximum number of OTP verification attempts allowed.
 */
export function getMaxOTPAttempts(): number {
  return OTP_MAX_ATTEMPTS;
}

/**
 * Valid OTP purposes — restricts what an OTP can be used for.
 */
export const OTP_PURPOSES = {
  ADMIN_2FA: 'admin_2fa',
  SUSPICIOUS_LOGIN: 'suspicious_login',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
} as const;

export type OTPPurpose = (typeof OTP_PURPOSES)[keyof typeof OTP_PURPOSES];

/**
 * Validate that a purpose string is a valid OTP purpose.
 */
export function isValidOTPPurpose(purpose: string): purpose is OTPPurpose {
  return Object.values(OTP_PURPOSES).includes(purpose as OTPPurpose);
}
