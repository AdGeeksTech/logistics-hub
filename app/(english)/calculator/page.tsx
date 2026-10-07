import Calculator from "@/components/calculator-page";
import { alternatePaths } from "@/lib/i18n";
import { getT } from "@/lib/site-texts";
export async function generateMetadata() {
  const t = await getT("en");
  return {
    title: t("Auction fee calculator"),
    description: t(
      "Estimate Copart and IAAI buyer, bid, gate and service fees on top of a winning bid, using each auction’s official schedule.",
    ),
    alternates: {
      canonical: "/calculator",
      languages: alternatePaths("/calculator"),
    },
  };
}
export default function Page() {
  return <Calculator />;
}
