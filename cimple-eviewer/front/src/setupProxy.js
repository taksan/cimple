const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        createProxyMiddleware('/api', {
            target: 'http://localhost:5000',  // Replace with your backend server URL
            changeOrigin: true,
        })
    );
    app.use(
        createProxyMiddleware('/socket', {
            target: 'ws://localhost:5000',
            changeOrigin: true,
            ws: true,
            logger: console
        })
    );
};
