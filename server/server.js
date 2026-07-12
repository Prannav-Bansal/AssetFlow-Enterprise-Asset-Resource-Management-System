require('dotenv').config();

const connectDB = require('./config/db');
const createApp = require('./app');
const { startJobs } = require('./jobs');

const PORT = process.env.PORT || 5000;

/**
 * Boots the application: connect to MongoDB, start the HTTP server, then
 * register background cron jobs.
 */
const start = async () => {
  await connectDB();

  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`✓ AssetFlow API listening on http://localhost:${PORT}`);
  });

  startJobs();

  // Graceful shutdown on fatal errors.
  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (err) => {
    console.error('✗ Unhandled promise rejection:', err);
  });
};

start();
