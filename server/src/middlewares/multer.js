import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const subtitleTypes = [
    "text/plain",
    "application/octet-stream",
    "application/x-subrip",
    "text/vtt",
  ];

  if (["thumbnail", "poster", "banner"].includes(file.fieldname)) {
    if (imageTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(
      new Error(
        "Only image files (jpg, png, webp) are allowed for thumbnails, posters, or banners",
      ),
      false,
    );
  }

  if (file.fieldname === "subtitle") {
    if (
      subtitleTypes.includes(file.mimetype) ||
      file.originalname.endsWith(".srt")
    ) {
      return cb(null, true);
    }
    return cb(new Error("Only subtitle files (.srt, .vtt) are allowed"), false);
  }

  if (file.fieldname === "video") {
    if (file.mimetype.startsWith("video/")) {
      return cb(null, true);
    }
    return cb(
      new Error("Only video files are allowed for episode uploads"),
      false,
    );
  }

  return cb(new Error("Unexpected file field"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
});
