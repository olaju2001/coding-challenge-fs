export interface SWAPIResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<{
      name: string;
      birth_year: string;
      homeworld: string;
    }>;
  }