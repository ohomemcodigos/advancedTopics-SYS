import { Injectable, BadRequestException } from '@nestjs/common';
import { Payment, PaymentMethod, PaymentStatus } from './payment.entity';

@Injectable()
export class PaymentService {
  private payments: Payment[] = [];

  processPayment(orderId: string, amount: number, method: PaymentMethod): Payment {
    if (amount <= 0) {
      throw new BadRequestException('Valor do pagamento deve ser maior que zero');
    }

    const newPayment = new Payment(orderId, amount, method);

    const isSuccess = Math.random() > 0.2;

    if (isSuccess) {
      newPayment.status = PaymentStatus.SUCCESS;
      newPayment.paidAt = new Date();
    } else {
      newPayment.status = PaymentStatus.FAILED;
    }

    this.payments.push(newPayment);
    return newPayment;
  }

  getPaymentByOrder(orderId: string): Payment | undefined {
    return this.payments.find(p => p.orderId === orderId);
  }
}