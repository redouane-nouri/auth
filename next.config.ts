import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  /*
    Bundles the app into a self-contained node_modules/server.js output.
  */
  output: "standalone",
};

export default withNextIntl(nextConfig);
