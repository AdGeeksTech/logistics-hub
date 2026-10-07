"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setListingStatus } from "@/app/admin/actions";
import { statuses, type Status } from "@/lib/cars";
import { adminTranslator, type AdminLang } from "@/lib/admin-i18n";

// Quick status change from the listings table, e.g. marking a car sold.
export function StatusSelect({
  id,
  status,
  lang,
}: {
  id: number;
  status: Status;
  lang: AdminLang;
}) {
  const t = adminTranslator(lang);
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <>
      <select
        className={`admin-status status-${value}`}
        value={value}
        disabled={pending}
        aria-label={t("Status")}
        onChange={(e) => {
          const next = e.target.value as Status;
          setValue(next);
          setError("");
          startTransition(async () => {
            const result = await setListingStatus(id, next);
            if (!result.ok) {
              setValue(status);
              setError(
                t(
                  Object.values(result.errors ?? {})[0] ??
                    "The listing could not be saved. Try again.",
                ),
              );
            }
            router.refresh();
          });
        }}
      >
        {Object.entries(statuses).map(([key, label]) => (
          <option key={key} value={key}>
            {t(label)}
          </option>
        ))}
      </select>
      {error && (
        <span className="admin-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
