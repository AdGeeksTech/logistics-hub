"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setAdminLanguage } from "@/app/admin/actions";
import type { AdminLang } from "@/lib/admin-i18n";

export function LanguageToggle({ lang }: { lang: AdminLang }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="admin-lang" role="group" aria-label="Language / ენა">
      {(
        [
          ["ka", "ქარ", "ქართული"],
          ["en", "EN", "English"],
        ] as const
      ).map(([value, label, name]) => (
        <button
          key={value}
          type="button"
          lang={value}
          aria-label={name}
          aria-pressed={lang === value}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setAdminLanguage(value);
              router.refresh();
            })
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
