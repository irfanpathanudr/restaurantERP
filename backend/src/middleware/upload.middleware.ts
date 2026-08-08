import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const menuImagesDir = path.join(uploadsDir, 'menu-images');
const menuFilesDir = path.join(uploadsDir, 'menu-files');

[uploadsDir, menuImagesDir, menuFilesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for menu images
const imageStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, menuImagesDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage configuration for Excel files
const fileStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, menuFilesDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// File filter for Excel files
const excelFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /xlsx|xls|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel') || file.mimetype === 'text/csv';

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (xlsx, xls, csv) are allowed!'));
  }
};

// Upload middleware for menu images
export const uploadMenuImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single('image');

// Upload middleware for menu import file
export const uploadMenuFile = multer({
  storage: fileStorage,
  fileFilter: excelFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}).single('file');

// Cleanup old files (optional utility)
export const cleanupOldFiles = (directory: string, maxAgeInDays: number = 7) => {
  const now = Date.now();
  const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;

  fs.readdir(directory, (err, files) => {
    if (err) return;

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
};
