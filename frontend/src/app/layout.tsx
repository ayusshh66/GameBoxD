
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameboxD",
  description:
    "Discover, rate, review and share your favorite games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
