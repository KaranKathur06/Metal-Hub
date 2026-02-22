/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  ...(isGithubPages
    ? {
        trailingSlash: true,
        basePath: "/Metal-Hub",
        assetPrefix: "/Metal-Hub/",
      }
    : {}),
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig;
