import DocumentLayout, { siteMetadata } from "@/components/document-layout";
export const metadata = siteMetadata("en");
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DocumentLayout locale="en">{children}</DocumentLayout>;
}
