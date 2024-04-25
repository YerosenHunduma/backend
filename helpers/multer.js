import fs from "fs";
import multer from "multer";
import path from "path";

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const checkFiletype = (file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type, You can only upload jpeg, jpg and png"),
      false
    );
  }
};

const uploadImageFromLocalToServer = multer({
  storage,
  // limits: { filesize: 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    checkFiletype(file, cb);
  },
});

export default uploadImageFromLocalToServer;
