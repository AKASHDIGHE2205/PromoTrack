// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import multer from "multer";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads", "attendance");

// const toDateStr = (date) => {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, "0");
//   const d = String(date.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// };

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dateFolder = toDateStr(new Date());
//     const dir = path.join(UPLOAD_ROOT, dateFolder);

//     fs.mkdirSync(dir, { recursive: true });

//     req.attendanceDateFolder = dateFolder;

//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname) || ".jpg";
//     const userId = req.user?.user_id || "unknown";

//     cb(null, `user${userId}_${Date.now()}${ext}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (!file.mimetype.startsWith("image/")) {
//     return cb(new Error("Only image files are allowed for the selfie."));
//   }

//   cb(null, true);
// };

// export const uploadSelfie = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 3 * 1024 * 1024 },
// }).single("selfie");

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPLOAD_ROOT = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "attendance",
);

const toMonthFolder = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}${month}`;
};

const toDateTimeStr = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const monthFolder = toMonthFolder(now);
    const dir = path.join(UPLOAD_ROOT, monthFolder);
    fs.mkdirSync(dir, { recursive: true });
    req.attendanceMonthFolder = monthFolder;

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const now = new Date();
    const timestamp = toDateTimeStr(now);
    const userId = req.user?.user_id || "unknown";
    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `${timestamp}-${userId}${ext}`;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed for the selfie."));
  }

  cb(null, true);
};

export const uploadSelfie = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
}).single("selfie");