const multer = require('multer');

// Files are kept in memory and converted to base64 data URIs before being
// saved to MongoDB. This avoids relying on Heroku's ephemeral filesystem.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

function fileToDataUri(file) {
  if (!file) return null;
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

module.exports = { upload, fileToDataUri };
