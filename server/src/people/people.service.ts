import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { SWAPIResponseSchema } from './dto/swapi-response.dto';
import { SWAPIResponse } from './interfaces/swapi.interface';
import { AxiosResponse } from 'axios';

interface HomeworldResponse {
  name: string;
  terrain: string;
  population: string;  // Added population
}

@Injectable()
export class PeopleService {
  private readonly baseUrl = 'https://swapi.dev/api';
  private readonly cacheTTL = 3600; // 1 hour

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPeople(page: number = 1, search?: string) {
    const cacheKey = `people_${page}_${search || ''}`;
    const cachedData = await this.cacheManager.get<SWAPIResponse>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const params = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
    });

    const response = await firstValueFrom(
      this.httpService.get<SWAPIResponse>(`${this.baseUrl}/people/?${params}`)
    );

    const peopleData = response.data;
    const validatedData = SWAPIResponseSchema.parse(peopleData);

    // Fetch homeworld data for each person
    const peopleWithHomeworlds = await Promise.all(
      validatedData.results.map(async (person) => {
        const homeworld = await this.getHomeworld(person.homeworld);
        return {
          ...person,
          homeworld: {
            name: homeworld.name,
            terrain: homeworld.terrain,
            population: this.parsePopulation(homeworld.population)  // Parse population
          },
        };
      })
    );

    const result = {
      ...validatedData,
      results: peopleWithHomeworlds,
    };

    await this.cacheManager.set(cacheKey, result, this.cacheTTL);
    return result;
  }

  private async getHomeworld(url: string) {
    const cacheKey = `homeworld_${url}`;
    const cachedData = await this.cacheManager.get<HomeworldResponse>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const response = await firstValueFrom(
      this.httpService.get<HomeworldResponse>(url)
    );

    const homeworld = response.data;
    await this.cacheManager.set(cacheKey, homeworld, this.cacheTTL);
    return homeworld;
  }

  private parsePopulation(population: string): number {
    try {
      if (population === 'unknown') return 0;
      
      // Remove any non-numeric characters except dots
      const cleanValue = population.replace(/[^0-9.]/g, '');
      const parsed = parseInt(cleanValue, 10);
      return isNaN(parsed) ? 0 : parsed;
    } catch (error) {
      console.error('Error parsing population:', error);
      return 0;
    }
  }
}