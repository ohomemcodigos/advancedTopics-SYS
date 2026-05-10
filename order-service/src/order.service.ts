import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
// Removidos os imports de JogoService, UserService e PaymentService
import { CreateOrderDto } from './dto/create-order.dto';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Injectable()
export class OrderService {
  private orders: any[] = [];

  constructor() { } // Construtor limpo sem dependências externas

  create(dto: CreateOrderDto) {
    const userId = dto.userId;

    const jogosSelecionados = dto.jogosIds.map(id => {
      return {
        jogoId: id,
        titulo: `Jogo ${id}`,
        preco: { valor: 150.00 } 
      };
    });

    const total = jogosSelecionados.reduce((acc, jogo) => acc + jogo.preco.valor, 0);

    const novaOrdem = {
      id: uuid(),
      userId: dto.userId,
      itens: jogosSelecionados.map(j => ({
        id: j.jogoId,
        titulo: j.titulo,
        preco: j.preco.valor
      })),
      valorTotal: total,
      status: OrderStatus.PENDING,
      metodoPagamento: dto.metodoPagamento,
      createdAt: new Date(),
    };

    this.orders.push(novaOrdem);
    return novaOrdem;
  }

  findAll() {
    return this.orders;
  }

  findOne(id: string) {
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return order;
  }

  async confirmOrder(id: string) {
    const order = this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Este pedido já foi processado ou cancelado');
    }

    // Simulando uma resposta de sucesso do Payment Service
    const paymentSuccess = true;

    if (paymentSuccess) {
      order.status = OrderStatus.CONFIRMED;
      return {
        message: 'Pagamento confirmado e pedido finalizado!',
        order,
        payment: {
          status: 'SUCCESS',
          transactionId: uuid()
        },
      };
    } else {
      order.status = OrderStatus.CANCELLED;
      throw new BadRequestException('Falha no pagamento. Pedido cancelado.');
    }
  }

  findByUser(userId: string) {
    return this.orders.filter(o => o.userId === userId);
  }
}