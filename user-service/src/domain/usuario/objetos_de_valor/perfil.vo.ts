import { Column } from 'typeorm';

export class Perfil {
  @Column({ name: 'nome', type: 'varchar', length: 255 })
  public readonly nome!: string;

  @Column({ name: 'nickname', type: 'varchar', length: 255 })
  public readonly nickname!: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255 })
  public readonly avatarUrl!: string;

  constructor(nome?: string, nickname?: string, avatarUrl?: string) {
    if (nome) {
      this.nome = nome;
    }
    if (nickname) {
      this.nickname = nickname;
    }
    if (avatarUrl) {
      this.avatarUrl = avatarUrl;
    }
  }
}