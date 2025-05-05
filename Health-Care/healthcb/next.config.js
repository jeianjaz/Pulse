/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lottie.host',
      },
      {
        protocol: 'https',
        hostname: 'raisingchildren.net.au',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'sbit3f.sgp1.digitaloceanspaces.com',
      }
    ],
  },
  trailingSlash: true,
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL_PROD}/api/:path*/`,
      }
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig;
