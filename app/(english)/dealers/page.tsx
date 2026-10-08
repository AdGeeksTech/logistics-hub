import Dealers from "@/components/dealer-page";
import { dealersMetadata } from "@/lib/page-metadata";
export function generateMetadata() {
  return dealersMetadata("en");
}
export default function Page() {
  return <Dealers />;
}
