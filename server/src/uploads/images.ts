import path from "path";
import fs from "fs";
import crypto from "crypto";
import sharp from "sharp";
import multer from "multer";

const configuredUploadDir = process.env.UPLOAD_DIR?.trim();

export const UPLOAD_DIR = configuredUploadDir
  ? path.resolve(configuredUploadDir)
  : path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images are allowed"));
    cb(null, true);
  },
});

export async function processToWebp(buffer: Buffer) {
  const id = crypto.randomUUID();
  const fullName = `${id}-full.webp`;
  const thumbName = `${id}-thumb.webp`;

  const fullPath = path.join(UPLOAD_DIR, fullName);
  const thumbPath = path.join(UPLOAD_DIR, thumbName);

  await sharp(buffer)
    .rotate()
    .resize(2560, 2560, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 88,
      effort: 6,
    })
    .toFile(fullPath);

  await sharp(buffer)
    .rotate()
    .resize(960, 960, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
      effort: 6,
    })
    .toFile(thumbPath);

  return {
    imageUrl: `/uploads/${fullName}`,
    thumbnailUrl: `/uploads/${thumbName}`,
  };
}
