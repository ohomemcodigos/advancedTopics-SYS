import { MetodoPagamento } from "./metodo_pagamento.vo";
import { Dinheiro } from "./dinheiro.vo";

export class Recibo{
   constructor(
      public readonly numeroRecibo: string,
      public readonly dataEmissao: Date,
      public readonly valorTotal: Dinheiro,
      public readonly metodoPagamento: MetodoPagamento
   ){

   }
}