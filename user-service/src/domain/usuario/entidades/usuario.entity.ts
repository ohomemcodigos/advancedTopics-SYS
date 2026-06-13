import { Entity, PrimaryColumn, Column } from 'typeorm';
import { Credenciais } from '../objetos_de_valor/credenciais.vo';
import { Regiao } from '../objetos_de_valor/regiao.vo';
import { Perfil } from '../objetos_de_valor/perfil.vo';

export enum TipoPerfil {
  CLIENTE = 'CLIENTE',
  ADMIN = 'ADMIN'
}

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryColumn({ name: 'usuario_id', type: 'varchar', length: 36 })
  public readonly usuarioId!: string;

  @Column({ name: 'data_criacao_conta', type: 'datetime' })
  public readonly dataCriacaoConta!: Date;

  @Column({ name: 'tipo_perfil', type: 'varchar', length: 20, default: 'CLIENTE' })
  public tipoPerfil!: TipoPerfil;

  @Column(() => Credenciais, { prefix: false })
  public credenciais!: Credenciais;

  @Column(() => Perfil, { prefix: false })
  public perfil!: Perfil;

  @Column(() => Regiao, { prefix: false })
  public regiao!: Regiao;

  constructor(
    usuarioId?: string,
    dataCriacaoConta?: Date,
    credenciais?: Credenciais,
    perfil?: Perfil,
    regiao?: Regiao,
    tipoPerfil?: TipoPerfil
  ) {
    if (usuarioId) {
      this.usuarioId = usuarioId;
    }
    if (dataCriacaoConta) {
      this.dataCriacaoConta = dataCriacaoConta;
    } else if (usuarioId) {
      this.dataCriacaoConta = new Date();
    }
    if (credenciais) this.credenciais = credenciais;
    if (perfil) this.perfil = perfil;
    if (regiao) this.regiao = regiao;
    this.tipoPerfil = tipoPerfil || TipoPerfil.CLIENTE;
  }

  get id(): string {
    return this.usuarioId;
  }
}