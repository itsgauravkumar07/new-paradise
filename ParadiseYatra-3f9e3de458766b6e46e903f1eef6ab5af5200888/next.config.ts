import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/,

  async redirects() {
    return [
      {
        source: "/blog/goa-or-kerala\\:-which-is-better-for-your-vacation-in-india-",
        destination: "/blog/goa-or-kerala-which-is-better-for-your-vacation-in-india",
        statusCode: 301,
      },
      {
        source: "/blog/chardham-yatra-tour-2025\\:-a-divine-journey-to-the-abode-of-gods",
        destination: "/blog/chardham-yatra-tour-2025-a-divine-journey-to-the-abode-of-gods",
        statusCode: 301,
      },
      {
        source: "/fixed-departures/deployment-package",
        destination: "/fixed-departures/manali-group-tour-3n-4d",
        statusCode: 301,
      },
    ];
  },

  //newly change
  async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "http://localhost:5001/api/:path*",
    },
  ];
},

  /* config options here */
  // output: 'standalone',
  productionBrowserSourceMaps: true,
  devIndicators: {
    position: "bottom-left",
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // Image optimization
  images: {
    qualities: [50, 60, 70, 75, 80, 90, 100],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Disable image optimization for external domains to prevent 404s
    unoptimized: false,
    // Allow all local images (with or without query strings)
    localPatterns: [
      { pathname: "/**" },
    ],
    // Add proper caching
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.travel-assets.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn-imgix.headout.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dynamic-media-cdn.tripadvisor.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media-cdn.tripadvisor.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.tripadvisor.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'badges.razorpay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
        port: '',
        pathname: '/**',
      },
      // Add Imgur support
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      },
      // Add YouTube thumbnail support with proper configuration
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
        port: '',
        pathname: '/**',
      },
      // Add Google user content support
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      // Add backend server support
      {
        protocol: 'https',
        hostname: 'backendparadise-backend.glwcvg.easypanel.host',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'paradise-yatra-backend.robn8s.easypanel.host',
        port: '',
        pathname: '/**',
      },
      // Add Cloudinary support
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',

      },
      // Add Wikimedia support for flag icons
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      // Only allow localhost in development
      ...(process.env.NODE_ENV === 'development' ? [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '5000',
          pathname: '/**',
        } as const,
        {
          protocol: 'http',
          hostname: '127.0.0.1',
          port: '5000',
          pathname: '/**',
        } as const
      ] : []),
      // Allow images from our proxy API route
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/proxy-image/**',
      } as const,
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/proxy-image/**',
      } as const,
      // Allow images from our uploaded-images API route
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/uploaded-images/**',
      } as const,
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/uploaded-images/**',
      } as const,
    ],
  },

  // Webpack optimizations for better performance
  webpack: (config, { dev, isServer }) => {
    // Optimize chunk loading for better performance
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            framerMotion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              chunks: 'all',
              priority: 20,
            },
            lucideReact: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: 'lucide-react',
              chunks: 'all',
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
        // Enable tree shaking
        usedExports: true,
        sideEffects: false,
      };
    }

    // Add performance hints
    config.performance = {
      ...config.performance,
      hints: dev ? false : 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };

    return config;
  },

  turbopack: {},

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    optimizeCss: true,
    // â† Remove any 'turbo' here if still present!
  },


  // Headers for better caching and security
  async headers() {
    const securityHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Accept-CH',
        value: 'DPR, Width, Viewport-Width',
      },
      {
        key: 'Critical-CH',
        value: 'DPR, Width, Viewport-Width',
      },
      {
        key: 'Vary',
        value: 'DPR, Width, Viewport-Width',
      },
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload',
            },
          ]
        : []),
    ];

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Add caching for API routes to prevent unlimited requests
      {
        source: '/api/uploaded-images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/proxy-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
