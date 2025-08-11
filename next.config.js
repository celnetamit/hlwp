/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static generation for better SEO
  output: 'standalone',
  
  // Optimize for academic content
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Headers for academic crawlers
  async headers() {
    return [
      {
        source: '/article/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'X-Academic-Content',
            value: 'peer-reviewed'
          }
        ]
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600'
          }
        ]
      }
    ]
  },
  
  // Redirects for legacy URLs
  async redirects() {
    return [
      {
        source: '/articles/:id',
        destination: '/article/:id',
        permanent: true,
      }
    ]
  }
}

module.exports = nextConfig