import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

export interface VersionInfo {
  version: string;
  environment: string;
  buildDate: string;
}

@Injectable({ providedIn: 'root' })
export class VersionService {
  // Signal readonly exposto para os componentes consumirem de forma reativa
  readonly info = signal<VersionInfo | null>(null);

  constructor(private http: HttpClient) {
    // A URL /api/v1/version é roteada pelo proxy Angular para o backend NestJS
    this.http
      .get<VersionInfo>('/api/v1/version')
      .pipe(
        catchError(() =>
          of({
            version: '0.1.0-dev',
            environment: 'local',
            buildDate: new Date().toISOString(),
          }),
        ),
      )
      .subscribe((info) => this.info.set(info));
  }
}
