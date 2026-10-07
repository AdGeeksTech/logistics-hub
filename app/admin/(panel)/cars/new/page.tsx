import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CarForm } from "@/components/admin/car-form";
import { getAdminLang } from "@/lib/admin-session";
import { adminTranslator } from "@/lib/admin-i18n";
import { emptyListing } from "@/lib/cars";
import { photoStorageKind } from "@/lib/photos";

export const metadata = { title: "Add a car" };

export default async function NewCar() {
  const lang = await getAdminLang();
  const t = adminTranslator(lang);
  return (
    <div className="admin-page">
      <Link className="admin-back" href="/admin/cars">
        <ArrowLeft size={16} aria-hidden="true" />
        {t("Car listings")}
      </Link>
      <h1>{t("Add a car")}</h1>
      <CarForm
        lang={lang}
        listing={null}
        initial={emptyListing()}
        photoStorage={photoStorageKind() !== null}
      />
    </div>
  );
}
