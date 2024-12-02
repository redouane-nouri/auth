import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import Header from "../components/layout/header";

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
      <body>
        <Theme accentColor="gray" grayColor="slate" appearance="light">
          <Header />
          {children}
        </Theme>
      </body>
    </html>
  );
}
