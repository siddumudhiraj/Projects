export interface HourlyReading {
  datetimeEpoch: number;
  time: string;
  temp: number;
  windspeed: number;
  precipprob: number;
  conditions: string;
  icon: string;
  isDay: boolean;
  isNow: boolean;
}

export interface CurrentConditions {
  temp: number;
  windspeed: number;
  precipprob: number;
  conditions: string;
  icon: string;
  humidity: number;
  feelslike: number;
}

export interface WeatherSnapshot {
  resolvedAddress: string;
  timezone: string;
  current: CurrentConditions;
  hours: HourlyReading[];
  fetchedAt: number;
}

export interface RawVisualCrossingHour {
  datetimeEpoch: number;
  datetime: string;
  temp: number;
  windspeed: number;
  precipprob: number;
  conditions: string;
  icon: string;
}

export interface RawVisualCrossingDay {
  datetime: string;
  hours: RawVisualCrossingHour[];
}

export interface RawVisualCrossingResponse {
  resolvedAddress: string;
  timezone: string;
  days: RawVisualCrossingDay[];
  currentConditions?: RawVisualCrossingHour & {
    humidity: number;
    feelslike: number;
    datetimeEpoch: number;
  };
}
