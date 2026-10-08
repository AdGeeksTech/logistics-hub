import Link from "next/link";
import { InquiryActions } from "@/components/admin/inquiry-actions";
import { getAdminLang } from "@/lib/admin-session";
import { adminTranslator } from "@/lib/admin-i18n";
import type { Inquiry } from "@/lib/inquiries";
import { getStore } from "@/lib/store";

export const metadata = { title: "Inquiries" };

const languageNames = { en: "English", ru: "Русский", ka: "ქართული" };

// A WhatsApp link needs the full international number; Georgian mobile
// numbers are often written without +995.
function whatsApp(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (/^5\d{8}$/.test(digits)) digits = `995${digits}`;
  return digits.length >= 10 ? `https://wa.me/${digits}` : null;
}

export default async function InquiriesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const lang = await getAdminLang();
  const t = adminTranslator(lang);
  const all: Inquiry[] = (await getStore()?.listInquiries()) ?? [];
  const show = (await searchParams).show === "handled" ? "handled" : "new";
  const shown = all.filter((inquiry) => inquiry.status === show);
  const count = (status: string) =>
    all.filter((inquiry) => inquiry.status === status).length;
  const date = new Intl.DateTimeFormat(lang === "ka" ? "ka-GE" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tbilisi",
  });
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>{t("Inquiries")}</h1>
          <p className="admin-hint">
            {t(
              "Requests sent through the form on the site, newest first. Reply by email or phone, then mark them as handled.",
            )}
          </p>
        </div>
      </div>
      <nav className="inquiry-tabs" aria-label={t("Inquiries")}>
        {(["new", "handled"] as const).map((status) => (
          <Link
            key={status}
            href={
              status === "new"
                ? "/admin/inquiries"
                : "/admin/inquiries?show=handled"
            }
            aria-current={show === status ? "page" : undefined}
          >
            {t(status === "new" ? "New" : "Handled")}
            <span>{count(status)}</span>
          </Link>
        ))}
      </nav>
      {shown.length === 0 ? (
        <p className="admin-empty">
          {t(
            show === "new"
              ? "No new inquiries. New ones appear here as soon as they are sent."
              : "No handled inquiries yet.",
          )}
        </p>
      ) : (
        <ul className="inquiry-list">
          {shown.map((inquiry) => {
            const chat = inquiry.phone ? whatsApp(inquiry.phone) : null;
            return (
              <li key={inquiry.id}>
                <article
                  className="inquiry"
                  aria-labelledby={`inquiry-${inquiry.id}`}
                >
                  <header>
                    <div>
                      <h2 id={`inquiry-${inquiry.id}`}>{inquiry.name}</h2>
                      <p className="inquiry-meta">
                        <time dateTime={inquiry.createdAt}>
                          {date.format(new Date(inquiry.createdAt))}
                        </time>
                        <span>{t(inquiry.audience)}</span>
                        <span>{t(inquiry.region)}</span>
                        <span>{languageNames[inquiry.locale]}</span>
                      </p>
                    </div>
                    <InquiryActions
                      id={inquiry.id}
                      status={inquiry.status}
                      lang={lang}
                    />
                  </header>
                  <p className="inquiry-message">{inquiry.message}</p>
                  <dl className="inquiry-contact">
                    <div>
                      <dt>{t("Email")}</dt>
                      <dd>
                        <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                      </dd>
                    </div>
                    {inquiry.phone && (
                      <div>
                        <dt>{t("Phone")}</dt>
                        <dd>
                          <a
                            href={`tel:${inquiry.phone.replace(/[^\d+]/g, "")}`}
                          >
                            {inquiry.phone}
                          </a>
                          {chat && (
                            <a href={chat} target="_blank" rel="noreferrer">
                              WhatsApp
                            </a>
                          )}
                        </dd>
                      </div>
                    )}
                    {inquiry.page && (
                      <div>
                        <dt>{t("Sent from")}</dt>
                        <dd>
                          <a
                            href={inquiry.page}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {inquiry.page}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
