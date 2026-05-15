export class ItemCarrinho{
   constructor(
      public readonly jogoId: string,
      public readonly preco: number
   ){
      if(!jogoId) throw new Error('ID do jogo é obrigatório.');
      if(preco < 0) throw new Error('Preço não pode ser negativo.');
   }
}