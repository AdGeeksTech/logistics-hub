import ThankYou from "@/components/thank-you-page";
import { thankYouMetadata } from "@/lib/page-metadata";
export function generateMetadata() {
  return thankYouMetadata("en");
}
export default function Page() {
  return <ThankYou />;
}
