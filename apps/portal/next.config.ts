import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbo monorepo: @sparticuz/chromium is hoisted to the repo root's
  // node_modules/, not apps/portal/node_modules/. Next.js's default
  // file-tracing scope is the app directory, so without this override
  // the hoisted binary is invisible and /var/task ends up missing
  // node_modules/@sparticuz/chromium/bin.
  outputFileTracingRoot: path.join(__dirname, "../../"),

  // Force-include files that Next's tracer can't see at compile time:
  //   - @sparticuz/chromium binary + libs (loaded dynamically inside
  //     the submit route's launchChromium())
  //   - lib/apollo/packages/** — JSON modules/schemas + style-library .md
  //     files read at runtime by packages-loader.ts via fs.readFileSync.
  //     Without explicit inclusion the serverless bundle ships without
  //     the catalog and every catalog-aware route 500s with ENOENT.
  outputFileTracingIncludes: {
    "/api/apollo/submit": [
      "../../node_modules/@sparticuz/chromium/**/*",
      "lib/apollo/packages/**/*",
    ],
    "/api/apollo/templates": [
      "lib/apollo/packages/**/*",
    ],
    "/api/apollo/templates/[slug]": [
      "lib/apollo/packages/**/*",
    ],
  },

  // Keep the package external so Next doesn't rewrite the import path
  // and confuse executablePath() resolution.
  serverExternalPackages: ["@sparticuz/chromium"],
};

export default nextConfig;
