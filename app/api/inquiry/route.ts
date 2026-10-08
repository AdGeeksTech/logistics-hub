import { NextResponse } from "next/server";
import { isLimited, limits, recordAttempt, visitorKey } from "@/lib/rate-limit";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Please send your inquiry from this website." },
      { status: 403 },
    );
  // Every request counts towards the visitor's limit, valid or not.
  const visitor = `inquiry:${visitorKey(request.headers)}`;
  if (await isLimited(visitor, limits.inquiry))
    return NextResponse.json(
      {
        error:
          "Too many inquiries from this connection. Please wait a few minutes and try again.",
      },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  await recordAttempt(visitor);
  if (Number(request.headers.get("content-length") || 0) > 16000)
    return NextResponse.json(
      { error: "Your inquiry is too long." },
      { status: 413 },
    );
  let data: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 16000)
      return NextResponse.json(
        { error: "Your inquiry is too long." },
        { status: 413 },
      );
    data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error("Invalid");
  } catch {
    return NextResponse.json(
      { error: "Please check your inquiry and try again." },
      { status: 400 },
    );
  }
  if (data.website)
    return NextResponse.json(
      { error: "Your inquiry could not be accepted." },
      { status: 400 },
    );
  const val = (key: string) =>
    typeof data[key] === "string" ? (data[key] as string).trim() : "";
  const name = val("name"),
    email = val("email"),
    phone = val("phone"),
    message = val("message"),
    audience = val("audience"),
    region = val("region");
  if (
    !name ||
    name.length > 120 ||
    email.length > 200 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    phone.length > 40 ||
    message.length < 10 ||
    message.length > 3000 ||
    !["Private buyer", "Dealer"].includes(audience) ||
    !["Not sure yet", "USA", "Europe", "China"].includes(region)
  )
    return NextResponse.json(
      {
        error:
          "Check your name, email and vehicle requirements, then try again.",
      },
      { status: 400 },
    );
  const { RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !INQUIRY_TO_EMAIL || !INQUIRY_FROM_EMAIL)
    return NextResponse.json(
      {
        error:
          "Online sending is not available yet. Please return to the form to prepare a downloadable inquiry.",
      },
      { status: 503 },
    );
  if (await isLimited("inquiry-emails", limits.inquiryEmails))
    return NextResponse.json(
      {
        error:
          "We are receiving too many inquiries right now. Please try again later.",
      },
      { status: 429, headers: { "Retry-After": "3600" } },
    );
  await recordAttempt("inquiry-emails");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: INQUIRY_FROM_EMAIL,
        to: [INQUIRY_TO_EMAIL],
        reply_to: email,
        subject: `Logistic Hub: ${audience} inquiry — ${region}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nRegion: ${region}\nCustomer: ${audience}\nPreferred language: ${["en", "ru", "ka"].includes(val("locale")) ? val("locale") : "en"}\n\n${message}`,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error("Provider failure");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "Your inquiry could not be sent. Your details are still in the form; please try again.",
      },
      { status: 502 },
    );
  }
}
