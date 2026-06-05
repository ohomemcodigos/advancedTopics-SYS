import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="main-wrapper">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .main-wrapper { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background-color: #1e1e2e; 
      min-height: 100vh; 
    }
  `]
})
export class AppComponent {}