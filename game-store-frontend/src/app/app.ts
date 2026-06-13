import { Component, signal } from '@angular/core';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [FooterComponent],
  template: `
    <h1>{{ title() }}</h1>
    <app-footer></app-footer>
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('game-store-frontend');
}