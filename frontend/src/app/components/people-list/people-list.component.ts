import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PeopleService } from '../../services/people.service';
import { 
  Person,
  PersonWithHomeworld,
  PaginatedResponse,
  Homeworld
} from '../../../../../shared-models/src/';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

interface AggregatedValues {
  totalPopulation: number;
  uniquePlanets: number;
  averagePopulationPerPlanet: number;
}

@Component({
  selector: 'app-people-list',
  templateUrl: './people-list.component.html',
  styleUrls: ['./people-list.component.css']
})
export class PeopleListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('intersectionTarget') intersectionTarget!: ElementRef;

  people: (Person | PersonWithHomeworld)[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  hasMore = true;
  searchControl = new FormControl('');
  totalCount = 0;
  initialLoadComplete = false;
  aggregatedValues: AggregatedValues = {
    totalPopulation: 0,
    uniquePlanets: 0,
    averagePopulationPerPlanet: 0
  };
  
  private destroy$ = new Subject<void>();
  private observer: IntersectionObserver | null = null;

  constructor(private peopleService: PeopleService) {
    console.log('PeopleListComponent constructed');
  }

  private isPersonWithHomeworld(person: Person | PersonWithHomeworld): person is PersonWithHomeworld {
    return typeof (person as PersonWithHomeworld).homeworld !== 'string';
  }

  trackByName(index: number, person: Person | PersonWithHomeworld): string {
    return person.url;
  }

  getTotalPopulation(): number {
    return this.aggregatedValues.totalPopulation;
  }

  getUniquePlanets(): number {
    return this.aggregatedValues.uniquePlanets;
  }

  getAveragePopulationPerPlanet(): string {
    return this.aggregatedValues.averagePopulationPerPlanet.toLocaleString();
  }

  private calculateAggregatedValues(): void {
    const planets = new Map<string, number>();
    let totalPopulation = 0;

    this.people.forEach(person => {
      if (this.isPersonWithHomeworld(person)) {
        const { name, population } = person.homeworld;
        if (population) {
          totalPopulation += population;
          planets.set(name, population);
        }
      }
    });

    this.aggregatedValues = {
      totalPopulation,
      uniquePlanets: planets.size,
      averagePopulationPerPlanet: planets.size > 0 ? Math.round(totalPopulation / planets.size) : 0
    };

    console.log('Calculated aggregated values:', this.aggregatedValues);
  }

  getHomeworldName(person: Person | PersonWithHomeworld): string {
    if (!this.isPersonWithHomeworld(person)) {
      return 'Loading...';
    }
    return person.homeworld.name || 'Unknown';
  }

  getTerrain(person: Person | PersonWithHomeworld): string {
    if (!this.isPersonWithHomeworld(person)) {
      return 'Loading...';
    }
    return person.homeworld.terrain || 'Unknown';
  }

  getPopulation(person: Person | PersonWithHomeworld): string {
    if (!this.isPersonWithHomeworld(person)) {
      return 'Loading...';
    }
    return person.homeworld.population?.toLocaleString() || 'Unknown';
  }

  ngOnInit() {
    console.log('PeopleListComponent initialized');
    this.setupSearch();
    this.loadInitialData();
  }

  ngAfterViewInit() {
    console.log('Setting up intersection observer');
    setTimeout(() => {
      this.setupIntersectionObserver();
      this.checkAndLoadMore();
    }, 500);
  }

  private setupIntersectionObserver(): void {
    if (this.observer) {
      console.log('Disconnecting existing observer');
      this.observer.disconnect();
    }

    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    console.log('Creating new intersection observer with options:', options);

    this.observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      console.log('Intersection Observer triggered:', {
        isIntersecting: entry.isIntersecting,
        isLoading: this.loading,
        hasMore: this.hasMore,
        currentPage: this.currentPage,
        totalItems: this.people.length,
        totalCount: this.totalCount,
        initialLoadComplete: this.initialLoadComplete
      });

      if (entry.isIntersecting && 
          !this.loading && 
          this.hasMore && 
          this.initialLoadComplete && 
          this.people.length > 0) {
        console.log('Conditions met for loading more data');
        this.loadMore();
      }
    }, options);

    if (this.intersectionTarget) {
      console.log('Starting to observe intersection target');
      this.observer.observe(this.intersectionTarget.nativeElement);
    } else {
      console.error('Intersection target not found');
    }
  }

  private checkAndLoadMore(): void {
    if (this.intersectionTarget) {
      const rect = this.intersectionTarget.nativeElement.getBoundingClientRect();
      const isVisible = rect.top <= window.innerHeight;
      
      console.log('Checking visibility:', {
        top: rect.top,
        windowHeight: window.innerHeight,
        isVisible,
        hasMore: this.hasMore,
        loading: this.loading
      });

      if (isVisible && !this.loading && this.hasMore && this.initialLoadComplete) {
        this.loadMore();
      }
    }
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.resetList();
    });
  }

  private loadInitialData(): void {
    this.currentPage = 1;
    this.initialLoadComplete = false;
    this.loadPeople();
  }

  loadPeople(): void {
    if (this.loading) {
      console.log('Already loading, skipping request');
      return;
    }
    
    console.log('Loading people:', {
      page: this.currentPage,
      currentCount: this.people.length,
      totalCount: this.totalCount
    });
    
    this.loading = true;
    this.error = '';

    this.peopleService.getPeople({
      page: this.currentPage,
      search: this.searchControl.value || '',
      limit: 10
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: PaginatedResponse) => {
        console.log('API Response:', response);
        
        if (response && Array.isArray(response.results)) {
          const newPeople = response.results;
          
          if (this.currentPage === 1) {
            this.people = newPeople;
          } else {
            this.people = [...this.people, ...newPeople];
          }
          
          this.totalCount = response.count;
          this.hasMore = !!response.next;
          
          console.log('Updated state:', {
            currentPage: this.currentPage,
            totalItems: this.people.length,
            hasMore: this.hasMore,
            totalCount: this.totalCount
          });
          
          this.calculateAggregatedValues();
        } else {
          console.error('Invalid response format:', response);
          this.error = 'Invalid data format received';
        }
        
        this.loading = false;
        if (this.currentPage === 1) {
          this.initialLoadComplete = true;
          this.checkAndLoadMore();
        }
      },
      error: (error) => {
        console.error('Error loading people:', error);
        this.error = 'Failed to load data. Please try again.';
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    console.log('LoadMore called:', {
      currentPage: this.currentPage,
      hasMore: this.hasMore,
      loading: this.loading,
      totalItems: this.people.length,
      totalCount: this.totalCount,
      remainingItems: this.totalCount - this.people.length
    });
    
    if (!this.loading && this.hasMore && this.initialLoadComplete) {
      this.currentPage++;
      console.log('Incrementing page to:', this.currentPage);
      this.loadPeople();
    } else {
      console.log('LoadMore conditions not met:', {
        notLoading: !this.loading,
        hasMore: this.hasMore,
        initialLoadComplete: this.initialLoadComplete
      });
    }
  }

  private resetList(): void {
    this.people = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.totalCount = 0;
    this.initialLoadComplete = false;
    this.aggregatedValues = {
      totalPopulation: 0,
      uniquePlanets: 0,
      averagePopulationPerPlanet: 0
    };
    this.loadPeople();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}