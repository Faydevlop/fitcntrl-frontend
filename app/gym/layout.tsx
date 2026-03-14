import DashboardLayout from "@/layouts/DashboardLayout";

export default function GymLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
