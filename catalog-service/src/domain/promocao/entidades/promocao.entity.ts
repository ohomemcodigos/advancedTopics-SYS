import { Periodo } from "../objetos_de_valor/periodo.vo";
export class Promocao{
   private _ativa: boolean;
   constructor(
      public readonly promocaoId: string, // UUID
      public readonly nome: string,
      public readonly desconto: number, // Porcentagem de desconto, ex: 20 para 20%
      public readonly periodo: Periodo,
      public readonly jogosIds: string[] 
   ){
      if(desconto <= 0 || desconto >= 100) throw new Error('Desconto deve ser entre 0 e 100.');
      if(jogosIds.length === 0) throw new Error('A promoção deve incluir pelo menos um jogo.');
      this._ativa = true;  
   }
   get ativa(): boolean{
      return this._ativa;
   }
   validacao(): boolean{
      const hoje = new Date();
      return this._ativa && this.periodo.data(hoje);
   }

   desativar(): void{
      this._ativa = false;
   }

}