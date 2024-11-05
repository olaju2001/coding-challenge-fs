import { z } from 'zod';

// Define schemas here instead of importing from shared-models for now
export const PersonSchema = z.object({
  name: z.string(),
  birth_year: z.string(),
  homeworld: z.string()
});

export const PaginationSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
});

export const SWAPIResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(PersonSchema)
});