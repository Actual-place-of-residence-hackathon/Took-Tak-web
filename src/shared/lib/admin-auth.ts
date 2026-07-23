import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "tt_admin_session";

function getPasscode(): string {
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode) {
    throw new Error("Missing ADMIN_PASSCODE. .env.local을 확인하세요.");
  }
  return passcode;
}

function sign(value: string): string {
  return createHmac("sha256", getPasscode()).update(value).digest("base64url");
}

export function createAdminSessionToken(): string {
  return sign("admin-ok");
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = sign("admin-ok");
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyPasscode(input: string): boolean {
  const expected = getPasscode();
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
