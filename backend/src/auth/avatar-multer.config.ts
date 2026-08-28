import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { UPLOAD_DIR } from '../attachments/multer.config';

export const AVATAR_DIR = `${UPLOAD_DIR}/avatars`;

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_AVATAR_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

export const avatarMulterConfig = {
  storage: diskStorage({
    destination: AVATAR_DIR,
    filename: (_req: any, file: any, cb: any) => {
      const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new BadRequestException('File harus berupa gambar (PNG/JPEG/GIF/WEBP)'), false);
    }
    cb(null, true);
  },
};
