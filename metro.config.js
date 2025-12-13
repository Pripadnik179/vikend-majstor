const { getDefaultConfig } = require('expo/metro-config');
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = getDefaultConfig(__dirname);

// Add proxy configuration for development
// Forward /api requests to Express server on port 5000
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Proxy /api requests to Express server
      if (req.url && req.url.startsWith('/api')) {
        const apiProxy = createProxyMiddleware({
          target: 'http://localhost:5000',
          changeOrigin: true,
          logLevel: 'warn',
        });
        return apiProxy(req, res, next);
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
