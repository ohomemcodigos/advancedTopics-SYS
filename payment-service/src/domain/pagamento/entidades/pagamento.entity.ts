import { MetodoPagamento } from "../objetos_de_valor/metodo_pagamento.vo";
import { Recibo } from "../objetos_de_valor/recibo.vo";
import { Dinheiro } from "../objetos_de_valor/dinheiro.vo";

export class Pagamento{
   private _status: string;
   private _recibo?: Recibo;//O recibo só é gerado após a confirmação do pagamento. Podendo ser Null ou Undefined até lá.
   constructor(
      public readonly pagamentoId: string, // UUID
      public readonly pedidoId: string, // UUID do pedido associado a esse pagamento
      public readonly valorTotal: Dinheiro,
      public readonly MetodoPagamento: MetodoPagamento,
   ){
      if(!pagamentoId) throw new Error('ID do pagamento é obrigatório.');
      if(!pedidoId) throw new Error('ID do pedido é obrigatório.');
      this._status = 'Pendente';
      if(valorTotal.valor <= 0) throw new Error('O valor total deve ser maior que zero.');
      if(!MetodoPagamento) throw new Error('Método de pagamento é obrigatório.');

      this._status = 'pendente';
   }

   get status(): string{
      return this._status;
   }
   get recibo(): Recibo | undefined{
      return this._recibo;
   }

   public aprovar(numeroRecibo: string): void{
      if(this._status === 'Aprovado') return;

      this._status = 'Aprovado';
      this._recibo = new Recibo(
         numeroRecibo,
         new Date(),
         this.valorTotal,
         this.MetodoPagamento
      );
   }

   public recusar(): void{
      if(this._status === 'Aprovado'){
         throw new Error('Não é possível recusar um pagamento já aprovado.');
      }
      this._status = 'Recusado';
   }

   public estornar(): void{
      if(this._status !== 'Aprovado'){
         throw new Error('Somente pagamentos aprovados podem ser estornados.');
      }
      this._status = 'Estornado';
   }
}