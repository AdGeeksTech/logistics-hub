"use client";
import { useActionState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { login } from "@/app/admin/actions";
import { adminTranslator, type AdminLang } from "@/lib/admin-i18n";

export function LoginForm({ lang }: { lang: AdminLang }) {
  const t = adminTranslator(lang);
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="admin-login-form">
      <label>
        {t("Password")}
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "login-error" : undefined}
        />
      </label>
      {state.error && (
        <p className="admin-error" id="login-error" role="alert">
          {t(state.error)}
        </p>
      )}
      <button className="button button-orange" disabled={pending}>
        {t("Sign in")}
        {pending ? (
          <LoaderCircle className="spin" size={18} />
        ) : (
          <ArrowUpRight size={18} />
        )}
      </button>
    </form>
  );
}
