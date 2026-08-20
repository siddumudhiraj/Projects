import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Weather } from './services/weather';
import { WeatherSnapshot } from './models/weather.model';
import { SearchBar } from './components/search-bar/search-bar';
import { CurrentWeather } from './components/current-weather/current-weather';
import { HourlyTimeline } from './components/hourly-timeline/hourly-timeline';

type LoadSource = { kind: 'query'; value: string } | { kind: 'coords'; lat: number; lon: number };

@Component({
  selector: 'app-root',
  imports: [DatePipe, SearchBar, CurrentWeather, HourlyTimeline],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private weatherService = inject(Weather);

  snapshot = signal<WeatherSnapshot | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  private lastSource: LoadSource | null = null;

  localTime = computed(() => {
    const data = this.snapshot();
    if (!data) return '';
    try {
      return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: data.timezone
      });
    } catch {
      return '';
    }
  });

  ngOnInit(): void {
    this.loadDefaultLocation();
  }

  onSearch(query: string): void {
    this.lastSource = { kind: 'query', value: query };
    this.runFetch(this.weatherService.fetchByLocation(query));
  }

  onRefresh(): void {
    if (!this.lastSource) {
      this.loadDefaultLocation();
      return;
    }
    const source = this.lastSource;
    const request$ =
      source.kind === 'query'
        ? this.weatherService.fetchByLocation(source.value)
        : this.weatherService.fetchByCoords(source.lat, source.lon);
    this.runFetch(request$);
  }

  async onUseMyLocation(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const position = await this.weatherService.getBrowserPosition();
      const { latitude, longitude } = position.coords;
      this.lastSource = { kind: 'coords', lat: latitude, lon: longitude };
      this.runFetch(this.weatherService.fetchByCoords(latitude, longitude));
    } catch {
      this.isLoading.set(false);
      this.errorMessage.set(
        'Could not get your location. Check location permissions, or search for a place instead.'
      );
    }
  }

  private async loadDefaultLocation(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const position = await this.weatherService.getBrowserPosition();
      const { latitude, longitude } = position.coords;
      this.lastSource = { kind: 'coords', lat: latitude, lon: longitude };
      this.runFetch(this.weatherService.fetchByCoords(latitude, longitude));
    } catch {
      this.lastSource = { kind: 'query', value: 'New Delhi' };
      this.runFetch(this.weatherService.fetchByLocation('New Delhi'));
    }
  }

  private runFetch(request$: ReturnType<Weather['fetchByLocation']>): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    request$.subscribe({
      next: (data) => {
        this.snapshot.set(data);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message || 'Something went wrong fetching the forecast.');
        this.isLoading.set(false);
      }
    });
  }
}
