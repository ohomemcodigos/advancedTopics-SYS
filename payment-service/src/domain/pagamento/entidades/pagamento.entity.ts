import { MetodoPagamento } from '../objetos_de_valor/metodo_pagamento.vo';
import { Recibo } from '../objetos_de_valor/recibo.vo';
import { Dinheiro } from '../objetos_de_valor/dinheiro.vo';

export class Pagamento {
  private _status: string;
  private _recibo?: Recibo;

  constructor(
    public readonly pagamentoId: string,
    public readonly pedidoId: string,
    public readonly valorTotal: Dinheiro,
    public readonly metodoPagamento: MetodoPagamento,
  ) {
    if (!pagamentoId) throw new Error('ID do pagamento é obrigatório.');
    if (!pedidoId) throw new Error('ID do pedido é obrigatório.');
    if (valorTotal.valor <= 0)
      throw new Error('O valor total deve ser maior que zero.');
    if (!metodoPagamento) throw new Error('Método de pagamento é obrigatório.');

    this._status = 'pendente';
  }

  get id(): string {
    return this.pagamentoId;
  }
  get status(): string {
    return this._status;
  }
  get recibo(): Recibo | undefined {
    return this._recibo;
  }
}
