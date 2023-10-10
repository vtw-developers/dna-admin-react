const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/dna/api/',
    createProxyMiddleware({
      target: 'http://localhost:8070',
      changeOrigin: true,
    })
  );
  app.use(
    createProxyMiddleware('/console', {
      target: 'http://localhost:8072',
      changeOrigin: true,
      ws: true,
    })
  );
};
