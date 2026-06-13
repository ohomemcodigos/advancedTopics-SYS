import { Column } from 'typeorm';

export class Regiao {
  @Column({ name: 'pais', type: 'varchar', length: 255 })
  public readonly pais!: string;

  constructor(pais?: string) {
    if (pais) {
      this.pais = pais;
    }
  }
}