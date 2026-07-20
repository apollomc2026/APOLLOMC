import type { NextConfig } from "next";
import path from "path";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  // Turbo monorepo: @sparticuz/chromium is hoisted to the repo root's
  // node_modules/, not apps/portal/node_modules/. Next.js's default
  // file-tracing scope is the app directory, so without this override
  // the hoisted binary is invisible and /var/task ends up missing
  // node_modules/@sparticuz/chromium/bin.
  outputFileTracingRoot: path.join(__dirname, "../../"),

  // Force-include the @sparticuz/chromium binary + libs in the submit
  // route's serverless bundle. Loaded dynamically inside launchChromium()
  // so Next's tracer can't see it at compile time.
  //
  // The packages catalog (lib/apollo/packages/**) is intentionally NOT
  // listed here — it's bundled into the JS chunk via the generated
  // packages-data.generated.ts module instead. Earlier attempts to include
  // it via this config did not survive the --turbopack production build:
  // the per-route .nft.json listed the files but Vercel's deployed function
  // still ENOENTed at runtime.
  outputFileTracingIncludes: {
    "/api/apollo/submit": [
      "../../node_modules/@sparticuz/chromium/**/*",
    ],
    "/.well-known/workflow/v1/flow": [
      "../../node_modules/@sparticuz/chromium/**/*",
    ],
    "/.well-known/workflow/v1/step": [
      "../../node_modules/@sparticuz/chromium/**/*",
    ],
  },

  // Keep the package external so Next doesn't rewrite the import path
  // and confuse executablePath() resolution.
  serverExternalPackages: ["@sparticuz/chromium"],

  // HS4.2: don't advertise the framework.
  poweredByHeader: false,

  // HS4.2: baseline security headers on every response. CSP is intentionally
  // limited to frame-ancestors (clickjacking) so it can't break the portal's
  // own HTML pages / bundled JS — a full resource CSP should be tuned and
  // added after page-by-page testing.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
        ],
      },
    ];
  },
};

export default withWorkflow(nextConfig);
