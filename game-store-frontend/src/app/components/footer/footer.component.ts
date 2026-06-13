import { Component, inject } from '@angular/core';
import { VersionService } from '../../services/version.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  template: `
    @if (versionSvc.info(); as info) {
      <footer class="app-footer">
        <span>Game Store {{ info.version }}</span>
        <span class="env-badge env-{{ info.environment.toLowerCase() }}">
          {{ info.environment }}
        </span>
      </footer>
    }
  `,
  styles: [
    `
      .app-footer {
        position: fixed;
        bottom: 0;
        right: 12px;
        font-size: 11px;
        color: #888;
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 4px 8px;
        background: #1e1e2e;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }
      .env-badge {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
      }
      .env-development {
        background: #fff3cd;
        color: #856404;
      }
      .env-production {
        background: #d4edda;
        color: #155724;
      }
      .env-local {
        background: #f8d7da;
        color: #721c24;
      }
    `,
  ],
})
export class FooterComponent {
  protected readonly versionSvc = inject(VersionService);
}
