import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  async getVersion() {
    try {
      const response = await fetch('http://localhost:5000/api/v1/version');
      if (!response.ok) throw new Error('Falha');
      return await response.json();
    } catch (error) {
      return { version: 'unknown', environment: 'local', buildDate: new Date() };
    }
  }
}