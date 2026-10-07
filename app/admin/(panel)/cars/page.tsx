import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Car, Plus, Search } from "lucide-react";
import { StatusSelect } from "@/components/admin/status-select";
import { getAdminLang } from "@/lib/admin-session";
import { adminTranslator } from "@/lib/admin-i18n";
import { listingSlug, listingTitle, statuses, type Status } from "@/lib/cars";
import { formatDate, money } from "@/lib/format";
import { getStore } from "@/lib/store";

export const metadata = { title: "Car listings" };

export default async function CarListingsAdmin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const lang = await getAdminLang();
  const t = adminTranslator(lang);
  const params = await searchParams;
  const all = (await getStore()?.listListings()) ?? [];
  const status =
    params.status && params.status in statuses
      ? (params.status as Status)
      : undefined;
  const query = params.q?.trim().toLowerCase() ?? "";
  const rows = all.filter(
    (l) =>
      (!status || l.status === status) &&
      (!query ||
        `${l.id} ${l.make} ${l.model} ${l.trim} ${l.vin} ${l.year}`
          .toLowerCase()
          .includes(query)),
  );
  const tabs: [Status | undefined, string][] = [
    [undefined, "All"],
    ["available", "Available"],
    ["reserved", "Reserved"],
    ["sold", "Sold"],
    ["draft", "Drafts"],
  ];
  const href = (s?: string) =>
    `/admin/cars${s || query ? "?" : ""}${new URLSearchParams({
      ...(s && { status: s }),
      ...(query && { q: query }),
    })}`;
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>{t("Car listings")}</h1>
        <Link className="button button-orange" href="/admin/cars/new">
          <Plus size={18} aria-hidden="true" />
          {t("Add a car")}
        </Link>
      </div>
      {params.deleted && (
        <p className="admin-flash" role="status">
          {t("The listing was deleted.")}
        </p>
      )}
      <div className="admin-toolbar">
        <nav className="admin-tabs" aria-label={t("Filter by status")}>
          {tabs.map(([value, label]) => (
            <Link
              key={label}
              href={href(value)}
              aria-current={status === value ? "page" : undefined}
            >
              {t(label)}{" "}
              <span>
                {value
                  ? all.filter((l) => l.status === value).length
                  : all.length}
              </span>
            </Link>
          ))}
        </nav>
        <form className="admin-search" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <Search size={17} aria-hidden="true" />
          <input
            name="q"
            type="search"
            defaultValue={params.q}
            placeholder={t("Search by make, model, VIN or ID")}
            aria-label={t("Search listings")}
          />
        </form>
      </div>
      {rows.length ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">{t("Photo")}</span>
              </th>
              <th scope="col">{t("Car")}</th>
              <th scope="col">{t("Price")}</th>
              <th scope="col">{t("Status")}</th>
              <th scope="col">{t("Updated")}</th>
              <th scope="col">
                <span className="sr-only">{t("Actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td className="admin-thumb">
                  {l.photos[0] ? (
                    <Image
                      src={l.photos[0].url}
                      alt=""
                      width={96}
                      height={72}
                      sizes="96px"
                    />
                  ) : (
                    <Car size={28} aria-hidden="true" />
                  )}
                </td>
                <td>
                  <Link href={`/admin/cars/${l.id}`} className="admin-car-name">
                    {listingTitle(l)} {l.year}
                  </Link>
                  <span className="admin-sub">
                    ID {l.id}
                    {l.trim && ` · ${l.trim}`} · {l.photos.length} {t("photos")}
                  </span>
                </td>
                <td>{l.price === null ? "—" : money(l.price, "en")}</td>
                <td>
                  <StatusSelect id={l.id} status={l.status} lang={lang} />
                </td>
                <td>{formatDate(l.updatedAt, "ka")}</td>
                <td className="admin-row-actions">
                  <Link href={`/admin/cars/${l.id}`}>{t("Edit")}</Link>
                  {l.status !== "draft" && (
                    <a
                      href={`${lang === "ka" ? "/ka" : ""}/cars/${listingSlug(l)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("View")}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="admin-empty">
          <Car size={40} aria-hidden="true" />
          <p>
            {all.length
              ? t("No listings match.")
              : t(
                  "No cars yet. Add the first one and it appears on the site as soon as you publish it.",
                )}
          </p>
          {!all.length && (
            <Link className="button" href="/admin/cars/new">
              {t("Add a car")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
