import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CarForm } from "@/components/admin/car-form";
import { getAdminLang } from "@/lib/admin-session";
import { adminTranslator } from "@/lib/admin-i18n";
import { listingTitle } from "@/lib/cars";
import { photoStorageKind } from "@/lib/photos";
import { getStore } from "@/lib/store";

export const metadata = { title: "Edit car" };

export default async function EditCar({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, query, lang] = await Promise.all([
    params,
    searchParams,
    getAdminLang(),
  ]);
  const t = adminTranslator(lang);
  const listing = /^\d{1,9}$/.test(id)
    ? await getStore()?.getListing(Number(id))
    : null;
  if (!listing) notFound();
  const notice = query.created
    ? listing.status === "draft"
      ? "Saved as a draft."
      : "Saved. The listing is live on the site."
    : query.copied
      ? "This is a copy saved as a draft. Change what differs, then publish."
      : undefined;
  return (
    <div className="admin-page">
      <Link className="admin-back" href="/admin/cars">
        <ArrowLeft size={16} aria-hidden="true" />
        {t("Car listings")}
      </Link>
      <h1>
        {listingTitle(listing)} {listing.year}{" "}
        <span className="admin-id">ID {listing.id}</span>
      </h1>
      <CarForm
        lang={lang}
        listing={listing}
        initial={listing}
        photoStorage={photoStorageKind() !== null}
        notice={notice && t(notice)}
      />
    </div>
  );
}
