import type { Metadata } from "next";
import { AppProviders } from "@/app/providers";
import "@/index.css";

export const metadata: Metadata = {
  title: "fitcntrl",
  description: "Gym management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
