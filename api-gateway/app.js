const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const port = process.env.PORT || 4000;

// Routes de proxy
app.use('/employe', createProxyMiddleware({ target: process.env.EMPLOYE_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/employe': '' } }));
app.use('/rh', createProxyMiddleware({ target: process.env.CONSEIL_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/rh': '' } }));
app.use('/compagnie', createProxyMiddleware({ target: process.env.COMPAGNIE_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/compagnie': '' } }));

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
