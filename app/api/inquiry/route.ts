import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
import {
  audiences,
  emailConfigured,
  regions,
  type InquiryFields,
} from "@/lib/inquiries";
import { isLimited, limits, recordAttempt, visitorKey } from "@/lib/rate-limit";
import { getStore } from "@/lib/store";
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
    !(audiences as readonly string[]).includes(audience) ||
    !(regions as readonly string[]).includes(region)
  )
    return NextResponse.json(
      {
        error:
          "Check your name, email and vehicle requirements, then try again.",
      },
      { status: 400 },
    );
  const locale = val("locale");
  const page = val("page");
  const inquiry: InquiryFields = {
    name,
    email,
    phone,
    audience: audience as InquiryFields["audience"],
    region: region as InquiryFields["region"],
    locale: isLocale(locale) ? locale : "en",
    message,
    page: /^\/[\w\-./%]{0,200}$/.test(page) ? page : null,
  };
  // Saved for the admin's Inquiries page, and emailed when configured.
  const store = getStore();
  if (!store && !emailConfigured())
    return NextResponse.json(
      {
        error:
          "Online sending is not available yet. Please return to the form to prepare a downloadable inquiry.",
      },
      { status: 503 },
    );
  if (await isLimited("inquiries", limits.inquiriesTotal))
    return NextResponse.json(
      {
        error:
          "We are receiving too many inquiries right now. Please try again later.",
      },
      { status: 429, headers: { "Retry-After": "3600" } },
    );
  await recordAttempt("inquiries");
  const [saved, emailed] = await Promise.all([
    store
      ?.createInquiry(inquiry)
      .then(() => true)
      .catch((error) => {
        console.error("Saving an inquiry failed", error);
        return false;
      }) ?? false,
    emailConfigured() ? sendEmail(inquiry) : false,
  ]);
  if (saved || emailed) return NextResponse.json({ ok: true });
  return NextResponse.json(
    {
      error:
        "Your inquiry could not be sent. Your details are still in the form; please try again.",
    },
    { status: 502 },
  );
}

async function sendEmail(inquiry: InquiryFields) {
  const { RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL } = process.env;
  const { name, email, phone, audience, region, locale, message, page } =
    inquiry;
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
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nRegion: ${region}\nCustomer: ${audience}\nPreferred language: ${locale}${page ? `\nSent from: ${page}` : ""}\n\n${message}`,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`Provider status ${response.status}`);
    return true;
  } catch (error) {
    console.error("Emailing an inquiry failed", error);
    return false;
  }
}
