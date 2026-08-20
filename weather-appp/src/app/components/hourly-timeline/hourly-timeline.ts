import { AfterViewInit, Component, ElementRef, effect, input, viewChild } from '@angular/core';
import { HourlyReading } from '../../models/weather.model';
import { WeatherIcon } from '../weather-icon/weather-icon';

@Component({
  selector: 'app-hourly-timeline',
  imports: [WeatherIcon],
  templateUrl: './hourly-timeline.html',
  styleUrl: './hourly-timeline.scss'
})
export class HourlyTimeline implements AfterViewInit {
  hours = input<HourlyReading[]>([]);
  scrollTrack = viewChild<ElementRef<HTMLDivElement>>('scrollTrack');

  readonly nowEpoch = Math.floor(Date.now() / 1000);

  constructor() {
    effect(() => {
      this.hours();
      setTimeout(() => this.centerOnNow(), 0);
    });
  }

  ngAfterViewInit(): void {
    this.centerOnNow();
  }

  private centerOnNow(): void {
    const track = this.scrollTrack()?.nativeElement;
    if (!track) return;
    const nowEl = track.querySelector<HTMLElement>('.is-now');
    if (!nowEl) return;
    const target = nowEl.offsetLeft - track.clientWidth / 2 + nowEl.clientWidth / 2;
    track.scrollTo({ left: Math.max(target, 0), behavior: 'smooth' });
  }
}
