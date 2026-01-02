/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/Metal-Hub",
  assetPrefix: "/Metal-Hub/",
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig;
