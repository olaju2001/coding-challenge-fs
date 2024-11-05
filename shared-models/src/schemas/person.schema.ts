import { z } from 'zod';
import { HomeworldSchema } from './homeworld.schema';

export const PersonSchema = z.object({
  name: z.string(),
  birth_year: z.string(),
  homeworld: z.string(), // URL to homeworld
  url: z.string()
});

export const PersonWithHomeworldSchema = PersonSchema.extend({
  homeworld: HomeworldSchema
});

export type Person = z.infer<typeof PersonSchema>;
export type PersonWithHomeworld = z.infer<typeof PersonWithHomeworldSchema>;