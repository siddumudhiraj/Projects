import { Component, input } from '@angular/core';
import { CurrentConditions } from '../../models/weather.model';
import { WeatherIcon } from '../weather-icon/weather-icon';

@Component({
  selector: 'app-current-weather',
  imports: [WeatherIcon],
  templateUrl: './current-weather.html',
  styleUrl: './current-weather.scss'
})
export class CurrentWeather {
  current = input.required<CurrentConditions>();
  resolvedAddress = input('');
  localTime = input('');
}
