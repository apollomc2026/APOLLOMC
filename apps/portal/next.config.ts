import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbo monorepo: @sparticuz/chromium is hoisted to the repo root's
  // node_modules/, not apps/portal/node_modules/. Next.js's default
  // file-tracing scope is the app directory, so without this override
  // the hoisted binary is invisible and /var/task ends up missing
  // node_modules/@sparticuz/chromium/bin.
  outputFileTracingRoot: path.join(__dirname, "../../"),

  // Force-include every file under the chromium package in the serverless
  // bundle for the submit route. The package ships a Brotli-compressed
  // chrome.br plus helper shared libs — all must land in /var/task.
  outputFileTracingIncludes: {
    "/api/apollo/submit": [
      "../../node_modules/@sparticuz/chromium/**/*",
    ],
  },

  // Keep the package external so Next doesn't rewrite the import path
  // and confuse executablePath() resolution.
  serverExternalPackages: ["@sparticuz/chromium"],
};

export default nextConfig;
