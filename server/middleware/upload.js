const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `receipt-${cleanBase.substring(0, 30)}-${uniqueSuffix}${ext}`);
  }
});

const allowedMimetypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, GIF images and PDF documents are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024 // 8 MB limit
  },
  fileFilter
});

module.exports = upload;
