import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventBus } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderGateway } from './gateways/order.gateway';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { OrderCreatedEvent } from './events/order-created.event';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  id: string;
  titulo: string;
  preco: number;
}

export interface Order {
  id: string;
  userId: string;
  itens: OrderItem[];
  valorTotal: number;
  status: OrderStatus;
  metodoPagamento: string;
  createdAt: Date;
}

export interface ConfirmOrderResponse {
  message: string;
  order: Order;
  payment: {
    status: string;
    transactionId: string;
  };
}

const PRECO_POR_JOGO = 49.9;

@Injectable()
export class OrderService {
  private orders: Order[] = [];
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    private readonly orderGateway: OrderGateway,
    private readonly eventBus: EventBus,
    @InjectMetric('orders_created_total')
    private readonly ordersCreatedCounter: Counter<string>,
    @InjectMetric('orders_cancelled_total')
    private readonly ordersCancelledCounter: Counter<string>,
  ) {}

  create(dto: CreateOrderDto): Order {
    this.logger.log({
      msg: 'Iniciando criação de pedido',
      action: 'create',
      userId: dto.userId,
    });

    const itens: OrderItem[] = dto.jogosIds.map((id: string) => ({
      id,
      titulo: 'Jogo Simulado para Teste',
      preco: PRECO_POR_JOGO,
    }));

    const valorTotal: number = +(itens.length * PRECO_POR_JOGO).toFixed(2);

    const novaOrdem: Order = {
      id: uuid(),
      userId: dto.userId,
      itens,
      valorTotal,
      status: OrderStatus.PENDING,
      metodoPagamento: dto.metodoPagamento,
      createdAt: new Date(),
    };

    this.orders.push(novaOrdem);
    this.ordersCreatedCounter.inc({ status: 'Criado' });

    this.eventBus.publish(
      new OrderCreatedEvent(novaOrdem.id, novaOrdem.userId, dto.jogosIds),
    );

    this.logger.log({
      msg: 'Pedido criado com sucesso',
      action: 'create',
      orderId: novaOrdem.id,
      status: novaOrdem.status,
    });
    return novaOrdem;
  }

  findAll(): Order[] {
    this.logger.log({
      msg: 'Buscando todos os pedidos',
      action: 'findAll',
    });
    return this.orders;
  }

  findOne(id: string): Order {
    this.logger.log({
      msg: 'Buscando pedido por ID',
      action: 'findOne',
      orderId: id,
    });
    const order: Order | undefined = this.orders.find((o) => o.id === id);
    if (!order) {
      this.logger.warn({
        msg: 'Pedido não encontrado',
        action: 'findOne',
        orderId: id,
      });
      throw new NotFoundException('Pedido não encontrado');
    }
    return order;
  }

  confirmOrder(id: string): ConfirmOrderResponse {
    this.logger.log({
      msg: 'Iniciando confirmação de pedido',
      action: 'confirmOrder',
      orderId: id,
    });
    const order: Order = this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn({
        msg: 'Tentativa de confirmar pedido já processado ou cancelado',
        action: 'confirmOrder',
        orderId: id,
        currentStatus: order.status,
      });
      throw new BadRequestException(
        'Este pedido já foi processado ou cancelado',
      );
    }

    order.status = OrderStatus.CONFIRMED;

    this.rabbitClient.emit('order_created', {
      pedidoId: order.id,
      valor: order.valorTotal,
      processadoEm: new Date(),
    });

    this.logger.log({
      msg: 'Pedido confirmado com sucesso',
      action: 'confirmOrder',
      orderId: order.id,
    });

    this.orderGateway.notificarStatusAlterado(order.id, {
      pedidoId: order.id,
      statusAnterior: 'PENDING',
      novoStatus: 'CONFIRMED',
      observacao: 'Pagamento confirmado com sucesso!',
      alteradoEm: new Date(),
    });

    this.logger.log({
      msg: 'Notificação WebSocket enviada para o frontend',
      action: 'confirmOrder',
      orderId: id,
    });

    return {
      message: 'Pagamento confirmado e pedido finalizado!',
      order,
      payment: {
        status: 'SUCCESS',
        transactionId: uuid(),
      },
    };
  }

  cancelOrder(id: string): { message: string; order: Order } {
    this.logger.log({
      msg: 'Iniciando cancelamento de pedido',
      action: 'cancelOrder',
      orderId: id,
    });
    const order: Order = this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn({
        msg: 'Tentativa de cancelar pedido já processado',
        action: 'cancelOrder',
        orderId: id,
        currentStatus: order.status,
      });
      throw new BadRequestException(
        'Somente pedidos pendentes podem ser cancelados',
      );
    }

    order.status = OrderStatus.CANCELLED;
    this.ordersCancelledCounter.inc();
    this.logger.log({
      msg: 'Pedido cancelado com sucesso',
      action: 'cancelOrder',
      orderId: id,
    });

    return { message: 'Pedido cancelado.', order };
  }

  findByUser(userId: string): Order[] {
    this.logger.log({
      msg: 'Buscando pedidos por usuário',
      action: 'findByUser',
      userId,
    });
    return this.orders.filter((o: Order) => o.userId === userId);
  }
}
