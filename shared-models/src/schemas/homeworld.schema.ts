import { z } from 'zod';

export const HomeworldSchema = z.object({
  name: z.string(),
  terrain: z.string(),
  population: z.string().transform(val => parseInt(val) || 0),
  url: z.string()
});

export type Homeworld = z.infer<typeof HomeworldSchema>;