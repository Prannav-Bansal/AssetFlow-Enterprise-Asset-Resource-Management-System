const { v2: cloudinary } = require('cloudinary');

/**
 * Cloudinary configuration.
 *
 * If the three Cloudinary env vars are present, uploads go to Cloudinary.
 * Otherwise `isConfigured` is false and the upload middleware transparently
 * falls back to local disk storage, so the app still runs without credentials.
 */
const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn(
    '⚠ Cloudinary credentials not found — file uploads will use local disk storage (/uploads).'
  );
}

module.exports = { cloudinary, isCloudinaryConfigured: isConfigured };
