import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { getNodeEnvFromEnv } from "./utils/functions";
import { NodeEnv } from "./utils/enums";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

/*
  the App Router injects its own hydration payload via inline <script> tags, this is why 'unsafe-inline'
  is present here.
  search about  nonce-based CSP if u want to remove that unsafe-inline

  'unsafe-eval' is dev-only, for React's dev-mode error-stack reconstruction; not needed in production.
*/
const isDev = getNodeEnvFromEnv() === NodeEnv.DEVELOPMENT;

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  /*
    Bundles the app into a self-contained node_modules/server.js output.
  */
  output: "standalone",
  /*
    Stop mentioning the framework in responses.
  */
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          /*
            Legacy fallback for browsers that don't support frame-ancestors.
          */
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          /*
            Only takes effect over HTTPS
          */
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
