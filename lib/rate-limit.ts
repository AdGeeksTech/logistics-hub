import { createHmac } from "node:crypto";
import { getStore } from "./store";

// Limits on repeated attempts (inquiries, admin sign-in), counted in the
// database so every server instance sees the same numbers.
export type Rule = { max: number; seconds: number };

// Visitors are told apart by a keyed hash of their IP address, so no
// address is stored; attempts are deleted after a day. On Vercel the
// address comes from headers the platform sets itself.
export function visitorKey(headers: Headers) {
  const ip =
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const secret =
    process.env.ADMIN_SESSION_SECRET || `limits:${process.env.ADMIN_PASSWORD}`;
  return createHmac("sha256", secret)
    .update(ip)
    .digest("base64url")
    .slice(0, 22);
}

// True once any rule's limit is reached. Fails open: a database problem
// must not stop customers from sending an inquiry.
export async function isLimited(bucket: string, rules: Rule[]) {
  try {
    const counts =
      (await getStore()?.countHits(
        bucket,
        rules.map((r) => r.seconds),
      )) ?? [];
    return rules.some((rule, i) => (counts[i] ?? 0) >= rule.max);
  } catch (error) {
    console.error("Rate limit check failed", error);
    return false;
  }
}

export async function recordAttempt(bucket: string) {
  try {
    await getStore()?.addHit(bucket);
  } catch (error) {
    console.error("Recording an attempt failed", error);
  }
}

export const limits = {
  // Failed admin sign-ins from one visitor.
  signIn: [
    { max: 10, seconds: 15 * 60 },
    { max: 30, seconds: 86400 },
  ],
  // Inquiry requests from one visitor.
  inquiry: [
    { max: 5, seconds: 10 * 60 },
    { max: 20, seconds: 86400 },
  ],
  // Accepted inquiries from everyone together, which keeps a flood of spam
  // from filling the admin or using up the email service's allowance.
  // INQUIRY_DAILY_LIMIT changes it (the local test server raises it).
  inquiriesTotal: [
    { max: Number(process.env.INQUIRY_DAILY_LIMIT) || 100, seconds: 86400 },
  ],
} satisfies Record<string, Rule[]>;
