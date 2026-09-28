"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Logistic Hub home">
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
export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav aria-label="Main navigation" className="desktop-nav">
          <Link href="/#services">Our services</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/dealers">For dealers</Link>
          <Link href="/#about">About us</Link>
        </nav>
        <Link href="/#inquiry" className="button header-cta">
          Let’s talk <ArrowUpRight size={17} />
        </Link>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {[
            ["Our services", "/#services"],
            ["How it works", "/#how-it-works"],
            ["For dealers", "/dealers"],
            ["About us", "/#about"],
            ["Let’s talk", "/#inquiry"],
          ].map(([label, href]) => (
            <Link href={href} key={href} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
