import multer from "multer";
import path from "path";
import fs from "fs";
export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/raw');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); //! To Prevent confilct in filenames
    cb(null, `${file.fieldname}-${uniqueSuffix}${file.originalname}`); //! To Prevent confilct in filenames
  },
});
