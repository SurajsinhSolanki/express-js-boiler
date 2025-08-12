import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadController } from './uploadController';
import { API_ROUTES, VERSION_1 } from '@/common/utils/apiRoutes';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { z } from 'zod';

export const uploadRegistry = new OpenAPIRegistry();
export const uploadRouter: Router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads' directory exists. You might want to make this configurable.
    const uploadPath = path.join(__dirname, '../../../public/uploads');
    // In a real application, you'd create this directory if it doesn't exist
    // fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Single file upload endpoint
uploadRegistry.registerPath({
  method: 'post',
  path: VERSION_1 + API_ROUTES.UPLOAD + '/single',
  tags: ['Upload'],
  summary: 'Upload a single file',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.string().openapi({ type: 'string', format: 'binary' })
          })
        }
      }
    }
  },
  responses: createApiResponse(
    z.object({
      filename: z.string(),
      originalname: z.string(),
      mimetype: z.string(),
      size: z.number(),
      path: z.string()
    }),
    'File uploaded successfully'
  )
});

uploadRouter.post(API_ROUTES.UPLOAD + '/single', upload.single('file'), uploadController.uploadSingleFile);

// Multiple files upload endpoint
uploadRegistry.registerPath({
  method: 'post',
  path: VERSION_1 + API_ROUTES.UPLOAD + '/multiple',
  tags: ['Upload'],
  summary: 'Upload multiple files',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            files: z.array(z.string().openapi({ type: 'string', format: 'binary' }))
          })
        }
      }
    }
  },
  responses: createApiResponse(
    z.array(
      z.object({
        filename: z.string(),
        originalname: z.string(),
        mimetype: z.string(),
        size: z.number(),
        path: z.string()
      })
    ),
    'Files uploaded successfully'
  )
});

uploadRouter.post(API_ROUTES.UPLOAD + '/multiple', upload.array('files', 10), uploadController.uploadMultipleFiles); // Max 10 files
