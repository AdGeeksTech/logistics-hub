import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// A single shared admin password (ADMIN_PASSWORD) signs a session cookie.
// Changing the password, or ADMIN_SESSION_SECRET, signs everyone out.
const cookieName = "lh_admin";
const sessionDays = 14;

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);
const secret = () =>
  process.env.ADMIN_SESSION_SECRET || `session:${process.env.ADMIN_PASSWORD}`;
const sign = (value: string) =>
  createHmac("sha256", secret()).update(value).digest("base64url");
const digest = (value: string) => createHash("sha256").update(value).digest();
const same = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

export function passwordMatches(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && same(input, password!);
}

function validSession(value: string | undefined) {
  if (!value || !adminConfigured()) return false;
  const [expires, signature] = value.split(".");
  return (
    Number(expires) > Date.now() &&
    Boolean(signature) &&
    same(signature, sign(expires))
  );
}

export async function isAdmin() {
  return validSession((await cookies()).get(cookieName)?.value);
}

// Pages redirect to the login screen; server actions and route handlers
// call this too, because they can be invoked without the page.
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function startSession() {
  const expires = String(Date.now() + sessionDays * 86400000);
  (await cookies()).set(cookieName, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDays * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(cookieName);
}
