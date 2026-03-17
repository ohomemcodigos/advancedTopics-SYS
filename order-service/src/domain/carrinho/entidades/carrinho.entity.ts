import { ItemCarrinho } from "../objetos_de_valor/item_carrinho.vo";
export class Carrinho{
   private _itens: ItemCarrinho[] = [];
   constructor(
      public readonly carrinhoId: string,
      public readonly usuarioId: string, 
   ){
      if(!usuarioId) throw new Error('ID do usuário é obrigatório.');
   }

   get itens(): ItemCarrinho[]{
      return [...this._itens];
   }
   get valorTotal(): number{
      return this._itens.reduce((total, item) => total + item.preco, 0);
   }
   adicionarJogo(item: ItemCarrinho): void{
      //Valida para não adicionar o mesmo jogo mais de uma vez.
      const jogoExistente = this._itens.find(i => i.jogoId === item.jogoId);
      if(jogoExistente){
         throw new Error('Item já existe no carrinho.');
      }
      this._itens.push(item);
   }
   removerJogo(jogoId: string): void{
      this._itens = this._itens.filter(i => i.jogoId !== jogoId);
   }

   esvaziar(): void{
      this._itens = [];
   }
}