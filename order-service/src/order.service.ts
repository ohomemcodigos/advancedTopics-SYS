import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventBus } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderGateway } from './gateways/order.gateway';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { OrderCreatedEvent } from './events/order-created.event';

export enum OrderStatus { PENDING = 'PENDING', CONFIRMED = 'CONFIRMED', CANCELLED = 'CANCELLED' }
export interface OrderItem { id: string; titulo: string; preco: number; }
export interface Order { id: string; userId: string; itens: OrderItem[]; valorTotal: number; status: OrderStatus; metodoPagamento: string; createdAt: Date; }
export interface ConfirmOrderResponse { message: string; order: Order; payment: { status: string; transactionId: string; }; }

@Injectable()
export class OrderService {
  private orders: Order[] = [];
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    private readonly orderGateway: OrderGateway,
    private readonly eventBus: EventBus,
    @InjectMetric('orders_created_total') private readonly ordersCreatedCounter: Counter<string>,
    @InjectMetric('orders_cancelled_total') private readonly ordersCancelledCounter: Counter<string>,
  ) {}

  create(dto: CreateOrderDto): Order {
    const itens: OrderItem[] = dto.jogosIds.map((id) => ({ id, titulo: 'Jogo', preco: 49.9 }));
    const novaOrdem: Order = { id: uuid(), userId: dto.userId, itens, valorTotal: 49.9, status: OrderStatus.PENDING, metodoPagamento: dto.metodoPagamento, createdAt: new Date() };
    this.orders.push(novaOrdem);
    this.rabbitClient.emit('PedidoCriado', { pedidoId: novaOrdem.id, valor: novaOrdem.valorTotal, metodoPagamento: novaOrdem.metodoPagamento });
    return novaOrdem;
  }

  findAll(): Order[] { return this.orders; }

  findOne(id: string): Order {
    const order = this.orders.find(o => o.id === id);
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  async confirmOrder(id: string): Promise<ConfirmOrderResponse> {
    const order = this.findOne(id);
    order.status = OrderStatus.CONFIRMED;
    this.orderGateway.notificarStatusAlterado(order.id, { pedidoId: order.id, novoStatus: 'CONFIRMED' });
    return { message: 'Confirmado', order, payment: { status: 'SUCCESS', transactionId: uuid() } };
  }

  cancelOrder(id: string): { message: string; order: Order } {
    const order = this.findOne(id);
    order.status = OrderStatus.CANCELLED;
    return { message: 'Cancelado', order };
  }

  findByUser(userId: string): Order[] { return this.orders.filter(o => o.userId === userId); }
}