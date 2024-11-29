import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Authentication",
  description: "Social Authentication using Auth.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-normal">{children}</body>
    </html>
  );
}
