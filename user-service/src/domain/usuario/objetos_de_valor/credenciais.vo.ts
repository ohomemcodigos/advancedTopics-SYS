import { Column } from 'typeorm';

export class Credenciais {
  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  public readonly email!: string;

  @Column({ name: 'senha_hash', type: 'varchar', length: 255 })
  public readonly senhaHash!: string;

  constructor(email?: string, senhaHash?: string) {
    if (email) {
      if (!email.includes('@')) throw new Error('Email inválido.');
      this.email = email;
    }
    if (senhaHash) {
      this.senhaHash = senhaHash;
    }
  }
}