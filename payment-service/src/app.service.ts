import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private payments: any[] = [];

  getPaymentByOrder(orderId: string) {
    this.logger.log(`Consultando pagamento para o pedido: ${orderId}`);
    return (
      this.payments.find((p) => p.orderId === orderId) || {
        message: 'Pagamento não encontrado',
      }
    );
  }

  processPayment(orderId: string, valor: number) {
    this.logger.log(`Processando pagamento de BRL ${valor} para pedido ${orderId}`);
    // Simulação de processamento
    const payment = {
      orderId,
      valor,
      status: 'SUCCESS',
      processedAt: new Date(),
      transactionId: Math.random().toString(36).substring(7),
    };
    this.payments.push(payment);
    return payment;
  }
}