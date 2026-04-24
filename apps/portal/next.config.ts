import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @sparticuz/chromium ships a Brotli-compressed Chromium binary under
  // node_modules/@sparticuz/chromium/bin. Next.js's tracing + bundler
  // relocates modules into /var/task at deploy time, which leaves the
  // binary stranded. Marking the package as a server-external package
  // keeps it on disk in its published layout so executablePath() resolves.
  serverExternalPackages: ["@sparticuz/chromium"],
};

export default nextConfig;
