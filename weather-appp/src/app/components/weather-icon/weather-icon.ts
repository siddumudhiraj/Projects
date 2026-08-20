import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-weather-icon',
  imports: [],
  templateUrl: './weather-icon.html',
  styleUrl: './weather-icon.scss'
})
export class WeatherIcon {
  icon = input('clear-day');
  size = input(40);

  glyph = computed(() => {
    const i = this.icon() || '';
    if (i.includes('thunder')) return 'thunder';
    if (i.includes('snow')) return 'snow';
    if (i.includes('rain') || i.includes('showers')) return 'rain';
    if (i.includes('fog')) return 'fog';
    if (i.includes('wind')) return 'wind';
    if (i === 'cloudy') return 'cloudy';
    if (i.includes('partly-cloudy-night')) return 'partly-night';
    if (i.includes('partly-cloudy-day')) return 'partly-day';
    if (i.includes('clear-night')) return 'clear-night';
    return 'clear-day';
  });
}
