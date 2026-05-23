//VO responsável por armazenar o país do usuário.
export class Regiao{
   constructor(
      public readonly pais: string
   ){
      if(!pais) throw new Error('País é obrigatório.');
   }
}