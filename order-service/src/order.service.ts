import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { JogoService } from '../jogo/jogo.service';
import { UserService } from '../user/user.service';
import { PaymentService } from '../payment/payment.service';
import { CreateOrderDto } from './dto/create-order.dto';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Injectable()
export class OrderService {
  private orders: any[] = [];

  constructor(
    private readonly jogoService: JogoService,
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
  ) { }

  create(dto: CreateOrderDto) {
    const user = this.userService.findOne(dto.userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const jogosSelecionados = dto.jogosIds.map(id => {
      const jogo = this.jogoService.findOne(id);
      if (!jogo) {
        throw new NotFoundException(`Jogo com ID ${id} não encontrado`);
      }
      return jogo;
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

    const payment = this.paymentService.processPayment(
      order.id,
      order.valorTotal,
      order.metodoPagamento,
    );

    if (payment.status === 'SUCCESS') {
      order.status = OrderStatus.CONFIRMED;
      return {
        message: 'Pagamento confirmado e pedido finalizado!',
        order,
        payment,
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