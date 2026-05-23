import { itemPedido } from "../objetos_de_valor/item_pedido.vo";
import { statusPedido } from "../objetos_de_valor/status_pedido.vo";
export class Pedido{
   constructor(
      public readonly pedidoId: string, // UUID
      public readonly usuarioId: string, // UUID do usuário que fez o pedido
      public readonly dataPedido: Date,
      public itens: itemPedido[],
      public status: statusPedido
   ){
      if(!pedidoId) throw new Error('ID do pedido é obrigatório.');
      if(!usuarioId) throw new Error('ID do usuário é obrigatório.');
      if(itens.length === 0) throw new Error('O pedido deve conter pelo menos um item.');
   }
}
//Possibilidade de adicionar um campo de valor total e um VO com uma "licença de jogo/chave de ativação"
