import { storage } from "../config/multer.config";
import multer from "multer";
export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."));
      }
    },
  });
  