import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionService } from '../../services/version.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-footer">
      <span>GestãoPedidos v{{ info?.version }}</span>
      <span class="env-badge" [ngClass]="'env-' + info?.environment?.toLowerCase()">
        {{ info?.environment }}
      </span>
    </div>
  `,
  styles: [`
    .app-footer { position: fixed; bottom: 0; right: 12px; font-size: 11px; color: #888; display: flex; gap: 8px; align-items: center; padding: 4px 8px; background: #1e1e2e; border-top-left-radius: 8px; border-top-right-radius: 8px;}
    .env-badge { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .env-development { background: #FFF3CD; color: #856404; }
    .env-production { background: #D4EDDA; color: #155724; }
    .env-local { background: #f8d7da; color: #721c24; }
  `]
})
export class FooterComponent implements OnInit {
  versionService = inject(VersionService);
  info: any;

  async ngOnInit() {
    this.info = await this.versionService.getVersion();
  }
}