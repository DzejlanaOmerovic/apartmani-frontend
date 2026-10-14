import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Koren aplikacije – samo prikazuje trenutnu stranicu
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
