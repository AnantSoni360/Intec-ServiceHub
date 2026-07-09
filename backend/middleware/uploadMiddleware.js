const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, Word, Excel, and text files are allowed.'), false);
  }
};

const fileType = require('file-type');

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const validateMagicBytes = async (req, res, next) => {
  if (!req.files) return next();
  
  try {
    const keys = Object.keys(req.files);
    for (const key of keys) {
      for (const file of req.files[key]) {
        const type = await fileType.fromFile(file.path);
        // fileType returns undefined for text files like CSV. 
        // If it returns something, ensure it's not an executable/binary (unless it's an allowed image/pdf type from multer).
        // Since multer already checked the extension/mime, we just want to catch spoofed executables here.
        if (type && !['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'].includes(type.mime)) {
          // It's a detected binary type that isn't one of our allowed rich types.
          // This means a .csv might actually be an .exe
          throw new Error(`File validation failed for ${file.originalname}. Suspected binary content.`);
        }
      }
    }
    next();
  } catch (error) {
    // Delete all uploaded files on error
    Object.keys(req.files).forEach(key => {
      req.files[key].forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    });
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { upload, validateMagicBytes };
