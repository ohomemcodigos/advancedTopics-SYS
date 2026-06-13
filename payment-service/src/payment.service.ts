import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private payments: any[] = [];

  getPaymentByOrder(orderId: string) {
    return this.payments.find(p => p.orderId === orderId) || { message: 'Pagamento não encontrado' };
  }

  processPayment(orderId: string, valor: number) {
    this.logger.log(`Processando pagamento de ${valor} para pedido ${orderId}`);
    const payment = { orderId, valor, status: 'SUCCESS' };
    this.payments.push(payment);
    return payment;
  }
}