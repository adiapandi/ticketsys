import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

const ALLOWED_MIME_TYPES = [
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream', // beberapa OS/browser kirim CSV dengan mimetype ini
];

export const bulkImportMulterConfig = {
  storage: memoryStorage(), // file diproses langsung di memori, tidak disimpan ke disk
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB cukup untuk ratusan baris user
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new BadRequestException('File harus berupa CSV atau Excel (.xlsx)'), false);
    }
    cb(null, true);
  },
};
