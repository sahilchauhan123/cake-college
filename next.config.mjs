/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'jdfswrmuigcbiyizxrfk.supabase.co',
      },
      {
        protocol:'https',
        hostname:'encrypted-tbn0.gstatic.com'
      }
    ],
  },
};

export default nextConfig;
