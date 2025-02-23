const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/Project1', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/Project1': '' }
}));
app.use('/Project2', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/Project2': '' }
}));

app.use('/Project3', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: { '^/Project3': '' }
}));

app.use('/Project4', createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: { '^/Project4': '' }
}));

app.use('/Project5', createProxyMiddleware({
    target: 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: { '^/Project5': '' }
}));

app.listen(3000, () => {
    console.log('Главный сервер запущен на http://localhost:3000');
});
