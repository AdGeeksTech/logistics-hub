import Calculator from "@/components/calculator-page";
import { calculatorMetadata } from "@/lib/page-metadata";
export function generateMetadata() {
  return calculatorMetadata("en");
}
export default function Page() {
  return <Calculator />;
}
