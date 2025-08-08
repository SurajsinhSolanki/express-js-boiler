import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  password: z.string(),
  isVerified: z.boolean().default(false),
  isAdmin: z.boolean().default(false),
  emailVerified: z.boolean().default(false),
  phoneVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional()
});

export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id })
});
