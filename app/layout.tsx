import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const display = localFont({
  src: "../public/fonts/barlow-condensed-600.ttf",
  variable: "--font-display",
  display: "swap",
});
const body = localFont({
  src: [
    { path: "../public/fonts/manrope-400.ttf", weight: "400" },
    { path: "../public/fonts/manrope-700.ttf", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "Logistic Hub — Your Choice. Our Responsibility.",
    template: "%s | Logistic Hub",
  },
  description:
    "Vehicle sourcing from the USA, Europe and China. Expert inspection, auction access and delivery support for private buyers and automotive dealers in Tbilisi.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
