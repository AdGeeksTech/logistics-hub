"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, RotateCcw, Trash2 } from "lucide-react";
import { deleteInquiry, setInquiryStatus } from "@/app/admin/actions";
import { adminTranslator, type AdminLang } from "@/lib/admin-i18n";
import type { InquiryStatus } from "@/lib/inquiries";

export function InquiryActions({
  id,
  status,
  lang,
}: {
  id: number;
  status: InquiryStatus;
  lang: AdminLang;
}) {
  const t = adminTranslator(lang);
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const run = (action: () => Promise<{ ok: boolean }>) =>
    start(async () => {
      setError("");
      if ((await action()).ok) router.refresh();
      else setError(t("That did not work. Reload the page and try again."));
    });
  return (
    <div className="inquiry-actions">
      <button
        type="button"
        className="button button-light"
        disabled={pending}
        onClick={() =>
          run(() => setInquiryStatus(id, status === "new" ? "handled" : "new"))
        }
      >
        {status === "new" ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <RotateCcw size={16} aria-hidden="true" />
        )}
        {t(status === "new" ? "Mark as handled" : "Mark as new")}
      </button>
      <button
        type="button"
        className="link-button inquiry-delete"
        disabled={pending}
        onClick={() => {
          if (window.confirm(t("Delete this inquiry? This cannot be undone.")))
            run(() => deleteInquiry(id));
        }}
      >
        <Trash2 size={14} aria-hidden="true" />
        {t("Delete")}
      </button>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
