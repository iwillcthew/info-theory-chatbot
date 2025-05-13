/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['pdfjs-dist'],
  },
  serverRuntimeConfig: {
    maxFileSize: '10mb',
  },
  publicRuntimeConfig: {
    maxUploadSize: '10mb',
  },
  async headers() {
    return [
      {
        source: '/documents/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/pdf',
          },
        ],
      },
    ];
  },
  // Cho phép truy cập vào tệp PDF từ thư mục documents
  output: 'standalone',
  outputFileTracing: true,
}

module.exports = nextConfig 