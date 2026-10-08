import { getStore } from "./store";
import type { Locale } from "./i18n";

// Inquiries sent through the site's form, kept for the admin's Inquiries
// page and, when configured, also emailed (see app/api/inquiry/route.ts).
export const audiences = ["Private buyer", "Dealer"] as const;
export const regions = ["Not sure yet", "USA", "Europe", "China"] as const;
export type InquiryFields = {
  name: string;
  email: string;
  phone: string;
  audience: (typeof audiences)[number];
  region: (typeof regions)[number];
  locale: Locale;
  message: string;
  // The page the form was sent from, such as a car's page.
  page: string | null;
};
export type InquiryStatus = "new" | "handled";
export type Inquiry = InquiryFields & {
  id: number;
  status: InquiryStatus;
  createdAt: string;
};

export const emailConfigured = () =>
  Boolean(
    process.env.RESEND_API_KEY &&
    process.env.INQUIRY_TO_EMAIL &&
    process.env.INQUIRY_FROM_EMAIL,
  );

// Whether the form can send at all: saved to the database, emailed, or
// both. Without either, visitors download a summary instead.
export const inquiriesEnabled = () => Boolean(getStore()) || emailConfigured();
