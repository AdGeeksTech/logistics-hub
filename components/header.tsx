"use client";
import { translator, localizedPath, type Locale } from "@/lib/i18n";
import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
export function Brand({ locale = "en" }: { locale?: Locale }) {
  const t = translator(locale);
  return (
    <Link
      href={localizedPath(locale, "/")}
      className="brand"
      aria-label={t("Logistic Hub home")}
    >
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M7 5v27h26M17 5v17h16M27 5v7h6"
          stroke="currentColor"
          strokeWidth="5"
        />
      </svg>
      <span>
        LOGISTIC
        <span>
          HUB<span className="brand-dot">.</span>
        </span>
      </span>
    </Link>
  );
}
export function Header({ locale = "en" }: { locale?: Locale }) {
  const t = translator(locale);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    const desktop = window.matchMedia("(min-width: 1101px)");
    function closeOnDesktop() {
      if (desktop.matches) setOpen(false);
    }
    desktop.addEventListener("change", closeOnDesktop);
    document.addEventListener("keydown", close);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      document.removeEventListener("keydown", close);
    };
  }, []);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand locale={locale} />
        <nav aria-label={t("Main navigation")} className="desktop-nav">
          <Link href={localizedPath(locale, "/#services")}>
            {t("Our services")}
          </Link>
          <Link href={localizedPath(locale, "/#how-it-works")}>
            {t("How it works")}
          </Link>
          <Link href={localizedPath(locale, "/dealers")}>
            {t("For dealers")}
          </Link>
          <Link href={localizedPath(locale, "/calculator")}>
            {t("Fee calculator")}
          </Link>
          <Link href={localizedPath(locale, "/#about")}>{t("About us")}</Link>
        </nav>
        <Link
          href={localizedPath(locale, "/#inquiry")}
          className="button header-cta"
        >
          {t("Let’s talk")}
          <ArrowUpRight size={17} />
        </Link>
        <LanguageSwitcher locale={locale} />
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={t(open ? "Close navigation" : "Open navigation")}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label={t("Mobile navigation")}
        >
          {[
            ["Our services", "/#services"],
            ["How it works", "/#how-it-works"],
            ["For dealers", "/dealers"],
            ["Fee calculator", "/calculator"],
            ["About us", "/#about"],
            ["Let’s talk", "/#inquiry"],
          ].map(([label, href]) => (
            <Link
              href={localizedPath(locale, href)}
              key={href}
              onClick={() => setOpen(false)}
            >
              {t(label)}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
