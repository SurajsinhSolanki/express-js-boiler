import { z } from 'zod';

export const commonValidations = {
  id: z
    .string()
    .refine(data => !Number.isNaN(Number(data)), 'ID must be a numeric value')
    .transform(Number)
    .refine(num => num > 0, 'ID must be a positive number')
};

export function validateRequest<T>(data: T, schema: z.ZodSchema<any>) {
  try {
    const parsedData = schema.parse(data);
    return { success: true, data: parsedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(err => err.message).join(', ') };
    }
    return { success: false, error: 'An unknown validation error occurred.' };
  }
}
