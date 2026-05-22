// Substitua os imports errados por este:
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Pagamento } from './domain/pagamento/entidades/pagamento.entity';
import { MetodoPagamento } from './domain/pagamento/objetos_de_valor/metodo_pagamento.vo';
import { Dinheiro } from './domain/pagamento/objetos_de_valor/dinheiro.vo';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private payments: Pagamento[] = [];

  // Ajuste o método para usar a entidade Pagamento que você já tem
  processPayment(pedidoId: string, valor: number, tipo: any): Pagamento {
    this.logger.log({
      msg: 'Iniciando processamento de pagamento',
      action: 'processPayment',
      pedidoId: pedidoId,
      valor: valor,
      tipoPagamento: tipo,
    });

    const valorTotal = new Dinheiro(valor);
    const metodo = new MetodoPagamento(tipo, 'Detalhes da transação');

    const novoPagamento = new Pagamento(
      randomUUID(),
      pedidoId,
      valorTotal,
      metodo,
    );

    this.payments.push(novoPagamento);
    this.logger.log({
      msg: 'Pagamento processado com sucesso',
      action: 'processPayment',
      pagamentoId: novoPagamento.pagamentoId,
      pedidoId: pedidoId,
    });
    return novoPagamento;
  }

  getPaymentByOrder(orderId: string): Pagamento | undefined {
    this.logger.log({
      msg: 'Buscando pagamento por ID do pedido',
      action: 'getPaymentByOrder',
      pedidoId: orderId,
    });

    const payment = this.payments.find((p) => p.pedidoId === orderId);

    if (!payment) {
      this.logger.warn({
        msg: 'Nenhum pagamento encontrado para este pedido',
        action: 'getPaymentByOrder',
        pedidoId: orderId,
      });
    } else {
      this.logger.log({
        msg: 'Pagamento encontrado',
        action: 'getPaymentByOrder',
        pedidoId: orderId,
        pagamentoId: payment.pagamentoId, // Supondo que a entidade Pagamento tenha um 'id'
      });
    }

    return payment;
  }
}
