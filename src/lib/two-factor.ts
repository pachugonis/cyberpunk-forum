import speakeasy from "speakeasy";
import QRCode from "qrcode";

/**
 * Generate a new two-factor authentication secret
 */
export function generateTwoFactorSecret(userEmail: string) {
  const secret = speakeasy.generateSecret({
    name: `Cyberpunk Forum (${userEmail})`,
    issuer: "Cyberpunk Forum",
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || "",
  };
}

/**
 * Generate QR code data URL from secret
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 2, // Allow 2 time steps before and after current time
  });
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    codes.push(code);
  }
  return codes;
}
