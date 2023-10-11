const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/dna/admin/',
    createProxyMiddleware({
      target: 'http://localhost:8075',
      changeOrigin: true,
    })
  );
};
