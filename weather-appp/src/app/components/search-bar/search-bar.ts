import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss'
})
export class SearchBar {
  isLoading = input(false);

  search = output<string>();
  refresh = output<void>();
  useMyLocation = output<void>();

  query = '';

  onSubmit(): void {
    const trimmed = this.query.trim();
    if (trimmed) {
      this.search.emit(trimmed);
    }
  }
}
