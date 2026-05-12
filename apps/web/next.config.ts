import type { NextConfig } from "next";

function getAllowedDevOrigins(): string[] {
  const raw = process.env.NEXT_ALLOWED_DEV_ORIGINS;
  const parsed = (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const defaults = ["localhost", "127.0.0.1"];
  return Array.from(new Set([...defaults, ...parsed]));
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
};

export default nextConfig;
