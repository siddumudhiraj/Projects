import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { RawVisualCrossingResponse, WeatherSnapshot, HourlyReading } from '../models/weather.model';

const BASE_URL =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

@Service()
export class Weather {
  private http = inject(HttpClient);

  fetchByLocation(location: string): Observable<WeatherSnapshot> {
    return this.fetchRaw(location);
  }

  fetchByCoords(lat: number, lon: number): Observable<WeatherSnapshot> {
    return this.fetchRaw(`${lat},${lon}`);
  }

  getBrowserPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 8000,
        maximumAge: 5 * 60 * 1000
      });
    });
  }

  private fetchRaw(locationSegment: string): Observable<WeatherSnapshot> {
    if (
      !environment.visualCrossingApiKey ||
      environment.visualCrossingApiKey === 'YOUR_API_KEY_HERE'
    ) {
      return throwError(
        () =>
          new Error(
            'Missing Visual Crossing API key. Add yours in src/environments/environment.ts.'
          )
      );
    }

    const yesterday = this.formatDate(this.addDays(new Date(), -1));
    const tomorrow = this.formatDate(this.addDays(new Date(), 1));
    const encodedLocation = encodeURIComponent(locationSegment);

    const url =
      `${BASE_URL}/${encodedLocation}/${yesterday}/${tomorrow}` +
      `?unitGroup=metric&include=hours,current&key=${environment.visualCrossingApiKey}&contentType=json`;

    return this.http.get<RawVisualCrossingResponse>(url).pipe(
      map((raw) => this.toSnapshot(raw)),
      catchError((err) => {
        const message =
          err?.status === 401 || err?.status === 403
            ? 'That API key was rejected. Double-check it in environment.ts.'
            : err?.status === 400
            ? `Could not find "${locationSegment}". Try a different spelling (city, zip, or "city, country").`
            : 'Could not reach the weather service. Check your connection and try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  private toSnapshot(raw: RawVisualCrossingResponse): WeatherSnapshot {
    const nowEpoch = Math.floor(Date.now() / 1000);
    const windowStart = nowEpoch - 24 * 3600;
    const windowEnd = nowEpoch + 24 * 3600;

    const allHours = raw.days.flatMap((day) => day.hours);

    let closestIdx = 0;
    let closestDiff = Infinity;
    allHours.forEach((h, idx) => {
      const diff = Math.abs(h.datetimeEpoch - nowEpoch);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIdx = idx;
      }
    });

    const hours: HourlyReading[] = allHours
      .filter((h) => h.datetimeEpoch >= windowStart && h.datetimeEpoch <= windowEnd)
      .map((h) => ({
        datetimeEpoch: h.datetimeEpoch,
        time: h.datetime.slice(0, 5),
        temp: Math.round(h.temp),
        windspeed: Math.round(h.windspeed),
        precipprob: Math.round(h.precipprob ?? 0),
        conditions: h.conditions,
        icon: h.icon,
        isDay: !h.icon.includes('night'),
        isNow: allHours.indexOf(h) === closestIdx
      }));

    const current = raw.currentConditions;

    return {
      resolvedAddress: raw.resolvedAddress,
      timezone: raw.timezone,
      current: current
        ? {
            temp: Math.round(current.temp),
            windspeed: Math.round(current.windspeed),
            precipprob: Math.round(current.precipprob ?? 0),
            conditions: current.conditions,
            icon: current.icon,
            humidity: Math.round(current.humidity ?? 0),
            feelslike: Math.round(current.feelslike ?? current.temp)
          }
        : {
            temp: hours.find((h) => h.isNow)?.temp ?? 0,
            windspeed: hours.find((h) => h.isNow)?.windspeed ?? 0,
            precipprob: hours.find((h) => h.isNow)?.precipprob ?? 0,
            conditions: hours.find((h) => h.isNow)?.conditions ?? 'Unknown',
            icon: hours.find((h) => h.isNow)?.icon ?? 'clear-day',
            humidity: 0,
            feelslike: hours.find((h) => h.isNow)?.temp ?? 0
          },
      hours,
      fetchedAt: Date.now()
    };
  }

  private addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
