import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  PaginatedResponse, 
  PaginationQuery 
} from '../../../../shared-models/src';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {
  private apiUrl = '/api/people';
  private filterSubject = new BehaviorSubject<string>('');
  public filter$ = this.filterSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPeople(query: PaginationQuery): Observable<PaginatedResponse> {
    const params = new HttpParams()
      .set('page', query.page.toString())
      .set('limit', (query.limit || 10).toString())
      .set('search', query.search || '');

    return this.http.get<PaginatedResponse>(this.apiUrl, { params });
  }

  updateFilter(filter: string): void {
    this.filterSubject.next(filter);
  }

  /**
   * Helper method to create a pagination query object
   */
  createPaginationQuery(page: number = 1, search: string = '', limit: number = 10): PaginationQuery {
    return {
      page,
      search,
      limit
    };
  }
}