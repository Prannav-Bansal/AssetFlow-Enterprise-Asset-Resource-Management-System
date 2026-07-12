const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

/**
 * Builds and configures the Express application (without starting it). Kept
 * separate from server.js so it can be imported by tests.
 */
const createApp = () => {
  const app = express();

  // trust proxy so req.ip is correct behind Render/other reverse proxies.
  app.set('trust proxy', 1);

  // --- Security & parsing middleware ---
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  // Throttle abusive traffic on the API surface.
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Serve locally-stored uploads (used when Cloudinary is not configured).
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // --- Health check ---
  app.get('/api/health', (req, res) =>
    res.json({ success: true, message: 'AssetFlow API is running', timestamp: new Date() })
  );

  // --- Feature routes ---
  app.use('/api', apiRoutes);

  // --- 404 + central error handling (must be last) ---
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
