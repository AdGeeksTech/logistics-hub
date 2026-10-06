import Dealers from "@/components/dealer-page";
import { alternatePaths } from "@/lib/i18n";
export const metadata = {
  title: "For automotive dealers",
  alternates: { canonical: "/dealers", languages: alternatePaths("/dealers") },
};
export default function Page() {
  return <Dealers />;
}
