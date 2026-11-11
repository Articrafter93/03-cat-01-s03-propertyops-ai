import { randomBytes } from "node:crypto";
import type { NextConfig } from "next";

// Per-build key for the demo session cookie signature. Listed under `env` below, so Next replaces
// process.env.DEMO_SESSION_SECRET with this literal at compile time, in the only module that reads
// it: lib/session-key.ts, which is server-only. It is deliberately not a NEXT_PUBLIC_ variable.
// The first load of this file generates it; later loads in the same build process see it in
// process.env and keep it. A value set in the build environment is used instead, but an empty or
// short one is not accepted: empty means "generate one", short stops the build.
const providedSessionKey = process.env.DEMO_SESSION_SECRET;
if (providedSessionKey && providedSessionKey.length < 32) {
  throw new Error("DEMO_SESSION_SECRET must be at least 32 characters long, or unset so the build generates one");
}
process.env.DEMO_SESSION_SECRET = providedSessionKey || randomBytes(32).toString("hex");

// CSP for a static portfolio demo (no live backend, no HTML-injection sink).
// 'unsafe-inline' is required for Next.js hydration bootstrap and Tailwind/Recharts
// inline styles; acceptable here because all data is static seed and there is no
// user-generated content or dangerouslySetInnerHTML in the codebase.
// 'unsafe-eval' is added ONLY in development (React dev tooling needs eval); the
// production build stays strict without it.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  env: {
    DEMO_SESSION_SECRET: process.env.DEMO_SESSION_SECRET,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
