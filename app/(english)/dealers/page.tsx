import Dealers from "@/components/dealer-page";
import { alternatePaths } from "@/lib/i18n";
import { getT } from "@/lib/site-texts";
export async function generateMetadata() {
  const t = await getT("en");
  return {
    title: t("For automotive dealers"),
    description: t(
      "Access leading US vehicle auctions with expert lot review, bidding support, documentation and logistics from Logistic Hub.",
    ),
    alternates: {
      canonical: "/dealers",
      languages: alternatePaths("/dealers"),
    },
  };
}
export default function Page() {
  return <Dealers />;
}
