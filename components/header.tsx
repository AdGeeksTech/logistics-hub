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
      <svg viewBox="12 12 478 116" aria-hidden="true">
        {[0, 90, 180, 270].map((angle) => (
          <path
            key={angle}
            d="M73.5 14.11V36.5A30 30 0 0 0 103.5 66.5H125.89A56 56 0 0 0 73.5 14.11Z"
            fill="currentColor"
            transform={`rotate(${angle} 70 70)`}
          />
        ))}
        <path
          d="M70 57Q74 66 83 70Q74 74 70 83Q66 74 57 70Q66 66 70 57Z"
          className="brand-star"
        />
        <g
          transform="translate(155.97 82) scale(0.016731 -0.016731)"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="120"
          strokeLinejoin="round"
        >
          {wordmark.map(([x, d]) => (
            <path key={x} transform={`translate(${x} 0) scale(1.2 1)`} d={d} />
          ))}
        </g>
      </svg>
    </Link>
  );
}
// prettier-ignore
// "LOGISTIC HUB" glyph outlines from the supplied logo, as [x offset, path].
const wordmark: [number, string][] = [
  [0, "M1468 0H282Q254 0 230.0 10.0Q206 20 188.5 37.5Q171 55 161.0 79.0Q151 103 151 131V1434H411V260H1468Z"],
  [1813.9, "M1656 580Q1656 449 1611.0 339.0Q1566 229 1486.0 149.0Q1406 69 1296.5 24.5Q1187 -20 1058 -20H706Q577 -20 467.0 24.5Q357 69 277.0 149.0Q197 229 151.5 339.0Q106 449 106 580V854Q106 984 151.5 1094.5Q197 1205 277.0 1284.5Q357 1364 467.0 1409.0Q577 1454 706 1454H1058Q1187 1454 1296.5 1409.0Q1406 1364 1486.0 1284.5Q1566 1205 1611.0 1094.5Q1656 984 1656 854ZM1396 854Q1396 931 1371.5 993.5Q1347 1056 1302.5 1100.5Q1258 1145 1195.5 1169.5Q1133 1194 1058 1194H706Q630 1194 567.5 1169.5Q505 1145 460.0 1100.5Q415 1056 390.5 993.5Q366 931 366 854V580Q366 503 390.5 440.5Q415 378 460.0 333.5Q505 289 567.5 264.5Q630 240 706 240H1056Q1132 240 1194.5 264.5Q1257 289 1302.0 333.5Q1347 378 1371.5 440.5Q1396 503 1396 580Z"],
  [3932.7, "M1566 131Q1566 103 1556.0 79.0Q1546 55 1528.5 37.5Q1511 20 1487.0 10.0Q1463 0 1435 0H497Q461 0 419.5 8.5Q378 17 337.5 35.0Q297 53 260.0 81.5Q223 110 194.5 150.5Q166 191 149.0 244.5Q132 298 132 365V1069Q132 1105 140.5 1146.5Q149 1188 167.0 1228.5Q185 1269 214.0 1306.0Q243 1343 283.5 1371.5Q324 1400 377.0 1417.0Q430 1434 497 1434H1554V1174H497Q446 1174 419.0 1147.0Q392 1120 392 1067V365Q392 315 419.5 287.5Q447 260 497 260H1306V586H614V848H1435Q1463 848 1487.0 837.5Q1511 827 1528.5 809.0Q1546 791 1556.0 767.5Q1566 744 1566 717Z"],
  [5960.2, "M413 0H153V1434H413Z"],
  [6643.7, "M1529 422Q1529 345 1509.5 283.5Q1490 222 1458.0 175.0Q1426 128 1383.0 95.0Q1340 62 1294.0 41.0Q1248 20 1200.5 10.0Q1153 0 1111 0H108V260H1111Q1186 260 1227.5 304.0Q1269 348 1269 422Q1269 458 1258.0 488.0Q1247 518 1226.5 540.0Q1206 562 1176.5 574.0Q1147 586 1111 586H513Q450 586 377.0 608.5Q304 631 241.5 681.0Q179 731 137.5 812.0Q96 893 96 1010Q96 1127 137.5 1207.5Q179 1288 241.5 1338.5Q304 1389 377.0 1411.5Q450 1434 513 1434H1398V1174H513Q439 1174 397.5 1129.0Q356 1084 356 1010Q356 935 397.5 891.5Q439 848 513 848H1111H1113Q1155 847 1202.0 836.5Q1249 826 1295.5 804.0Q1342 782 1384.0 748.5Q1426 715 1458.5 668.0Q1491 621 1510.0 560.0Q1529 499 1529 422Z"],
  [8560.9, "M1447 1174H874V0H614V1174H40V1434H1447Z"],
  [10349.6, "M413 0H153V1434H413Z"],
  [11033.2, "M1435 0H497Q461 0 419.5 8.5Q378 17 337.5 35.0Q297 53 260.0 81.5Q223 110 194.5 150.5Q166 191 149.0 244.5Q132 298 132 365V1069Q132 1105 140.5 1146.5Q149 1188 167.0 1228.5Q185 1269 214.0 1306.0Q243 1343 283.5 1371.5Q324 1400 377.0 1417.0Q430 1434 497 1434H1435V1174H497Q446 1174 419.0 1147.0Q392 1120 392 1067V365Q392 315 419.5 287.5Q447 260 497 260H1435Z"],
  [13677.0, "M413 848H1326V1434H1586V0H1326V586H413V0H153V1434H413Z"],
  [15768.2, "M1556 131Q1556 103 1546.0 79.0Q1536 55 1518.0 37.5Q1500 20 1476.0 10.0Q1452 0 1425 0H839Q756 0 671.0 18.0Q586 36 506.5 73.5Q427 111 357.0 169.0Q287 227 234.5 306.5Q182 386 152.0 488.5Q122 591 122 717V1434H382V717Q382 607 412.5 531.0Q443 455 490.0 404.0Q537 353 593.0 324.0Q649 295 699.5 281.0Q750 267 788.5 263.5Q827 260 839 260H1296V1434H1556Z"],
  [17820.9, "M1582 315Q1582 267 1565.5 212.0Q1549 157 1511.5 110.0Q1474 63 1414.0 31.5Q1354 0 1267 0H280Q252 0 228.0 10.0Q204 20 186.5 37.5Q169 55 159.0 79.0Q149 103 149 131V1303Q149 1330 159.0 1354.0Q169 1378 186.5 1396.0Q204 1414 228.0 1424.0Q252 1434 280 1434H1150Q1198 1434 1253.0 1417.0Q1308 1400 1355.5 1362.5Q1403 1325 1434.5 1265.0Q1466 1205 1466 1118V1069Q1466 1000 1443.0 920.5Q1420 841 1369 770Q1413 743 1451.5 705.0Q1490 667 1519.0 617.0Q1548 567 1565.0 504.0Q1582 441 1582 365ZM1322 365Q1322 416 1306.0 456.5Q1290 497 1261.0 526.0Q1232 555 1191.0 570.5Q1150 586 1099 586H513V848H982Q1033 848 1074.0 863.5Q1115 879 1144.0 908.0Q1173 937 1188.5 977.5Q1204 1018 1204 1069V1118Q1204 1174 1150 1174H409V260H1267Q1274 260 1284.0 261.0Q1294 262 1302.0 267.0Q1310 272 1316.0 284.0Q1322 296 1322 317Z"],
];
export function Header({ locale = "en" }: { locale?: Locale }) {
  const t = translator(locale);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    const desktop = window.matchMedia("(min-width: 1201px)");
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
