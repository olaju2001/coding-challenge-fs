import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { PeopleService } from './people.service';
import { z } from 'zod';

const QueryParamsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  search: z.string().optional().default(''),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10)
});

@Controller('api/people')  // Changed from 'people' to 'api/people'
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  async getPeople(
    @Query(new ValidationPipe({ transform: true })) query: z.infer<typeof QueryParamsSchema>
  ) {
    const { page, search, limit } = QueryParamsSchema.parse(query);
    return this.peopleService.getPeople(page, search);
  }
}