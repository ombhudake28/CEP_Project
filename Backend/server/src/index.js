require('dotenv').config();
const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const startServer = async () => {
  server.listen(PORT, () => {
    console.log(`[+] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

// Graceful shutdown handling
const shutdown = (signal) => {
  console.log(`[!] Received ${signal}, starting graceful shutdown...`);
  server.close(() => {
    console.log('[+] HTTP server closed.');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('[!] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
