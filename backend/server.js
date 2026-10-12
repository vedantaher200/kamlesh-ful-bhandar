// backend/server.js - Direct CommonJS serverless entrypoint for Vercel Express service
const app = require('./dist/server.js');

module.exports = app;
module.exports.default = app;
