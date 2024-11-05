import { z } from 'zod';
import { PersonSchema } from './person.schema';

export const PaginationSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(PersonSchema)
});

export const PaginationQuerySchema = z.object({
  page: z.number().optional().default(1),
  search: z.string().optional().default(''),
  limit: z.number().optional().default(10)
});

export type PaginatedResponse = z.infer<typeof PaginationSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;