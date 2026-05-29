/** @type {import('next').NextConfig} */
const nextConfig = {
  // NextAuth v4 doesn't auto-read VERCEL_URL, so set NEXTAUTH_URL from it
  // when the env var isn't explicitly configured (preview deployments).
  env: {
    NEXTAUTH_URL:
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  },
};

export default nextConfig;
