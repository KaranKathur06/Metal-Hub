/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  basePath: "/Metal-Hub",
  assetPrefix: "/Metal-Hub/",
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig;
