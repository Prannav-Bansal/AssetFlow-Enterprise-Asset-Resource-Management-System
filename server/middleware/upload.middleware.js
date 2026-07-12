const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Picks Cloudinary storage when credentials are configured, otherwise stores
 * files on local disk under /uploads. Either way the resulting public URL is
 * exposed on `req.file` for the controller to persist.
 */
let storage;
if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'assetflow',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    },
  });
} else {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
  cb(ApiError.badRequest('Only image files (jpeg, png, webp, gif) are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

/**
 * Resolves the public URL of an uploaded file regardless of the storage
 * backend. For local storage the URL is relative to the static /uploads mount.
 */
const resolveFileUrl = (req) => {
  if (!req.file) return undefined;
  if (isCloudinaryConfigured) return req.file.path; // Cloudinary secure URL
  return `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
};

module.exports = { upload, resolveFileUrl };
