import { Routes } from '@angular/router';
import { VitrineComponent } from './components/vitrine/vitrine';

export const routes: Routes = [
  { path: '', component: VitrineComponent },
  { path: '**', redirectTo: '' }
];