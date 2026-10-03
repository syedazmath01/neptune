import type { NextConfig } from "next";

// security.md Phase 13. No script-src CSP yet: Next inline runtime + theme script would need nonces.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Dashboard IA moved to the template's sections; keep old links working.
  async redirects() {
    return [
      { source: "/gaps", destination: "/opportunities", permanent: true },
      { source: "/recommendations", destination: "/opportunities", permanent: true },
      { source: "/results", destination: "/reports", permanent: true },
    ];
  },
};

export default nextConfig;
