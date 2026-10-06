import Calculator from "@/components/calculator-page";
import { alternatePaths } from "@/lib/i18n";
export const metadata = {
  title: "Auction fee calculator",
  description:
    "Estimate Copart and IAAI buyer, bid, gate and service fees on top of a winning bid, using each auction’s official schedule.",
  alternates: {
    canonical: "/calculator",
    languages: alternatePaths("/calculator"),
  },
};
export default function Page() {
  return <Calculator />;
}
