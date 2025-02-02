// next.config.js -->

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   swcMinify: true,
//   images: {
//     unoptimized: true,
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//         pathname: '/**'
//       }
//     ]
//   },
//   webpack: (config) => {
//     config.resolve.alias = {
//       ...config.resolve.alias,
//       'pdfjs-dist': require.resolve('pdfjs-dist'),
//     };
//     return config;
//   },
//   async headers() {
//     return [
//       {
//         source: '/pdf.worker.js',
//         headers: [
//           {
//             key: 'Cross-Origin-Opener-Policy',
//             value: 'same-origin',
//           },
//           {
//             key: 'Cross-Origin-Embedder-Policy',
//             value: 'require-corp',
//           },
//         ],
//       },
//     ];
//   }
// }; 


// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Only apply these options in development
    if (process.env.NODE_ENV === 'development') {
      config.watchOptions = {
        poll: false,  // Changed from polling to native watching
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/.next/**',
          '**/dist/**'
        ],
        aggregateTimeout: 300
      };
    }
    return config;
  },
  swcMinify: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**'
      }
    ]
  },
  // Add these experimental features
  experimental: {
    optimizePackageImports: ['@/components'],
    serverActions: true
  }
};

module.exports = nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   swcMinify: true,
//   images: {
//     unoptimized: true,
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//         pathname: '/**'
//       }
//     ]
//   },
//   // Remove onDemandEntries configuration
//   poweredByHeader: false,
//   reactStrictMode: true,
//   compress: true
// };

// module.exports = nextConfig;