export class itemPedido {
   constructor(
      public readonly jogoId: string,
      public readonly precoUnitario: number
   ){
      if(!jogoId) throw new Error('ID do jogo é obrigatório.');
      if(precoUnitario < 0) throw new Error('Preço unitário não pode ser negativo.');
   }
}
//Existe a possibilidade de adicionar quantidade aqui mas como é uma loja de jogos digitais a quantidade não tem relevância.