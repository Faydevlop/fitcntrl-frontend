import PublicLayout from "@/layouts/PublicLayout";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
