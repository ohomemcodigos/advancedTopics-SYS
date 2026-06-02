import { Injectable, Logger } from '@nestjs/common';
import { Pagamento } from './domain/pagamento/entidades/pagamento.entity';
import { MetodoPagamento } from './domain/pagamento/objetos_de_valor/metodo_pagamento.vo';
import { Dinheiro } from './domain/pagamento/objetos_de_valor/dinheiro.vo';
import { randomUUID } from 'crypto';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private payments: Pagamento[] = [];

  constructor(
    @InjectMetric('payments_processed_total')
    private readonly paymentsProcessedCounter: Counter<string>,
  ) {}

  processPayment(pedidoId: string, valor: number, tipo: string): Pagamento {
    this.logger.log({
      msg: 'Iniciando processamento de pagamento',
      action: 'processPayment',
      pedidoId: pedidoId,
      valor: valor,
      tipoPagamento: tipo,
    });

    try {
      const metodo = new MetodoPagamento(
        tipo as 'Cartão de Crédito' | 'Boleto' | 'Pix' | 'Carteira Digital',
        'Detalhes da transação',
      );

      const valorTransacao = new Dinheiro(valor, 'BRL');

      const novoPagamento = new Pagamento(
        randomUUID(),
        pedidoId,
        valorTransacao,
        metodo,
      );

      this.payments.push(novoPagamento);
      this.paymentsProcessedCounter.inc({ status: 'success' });
      this.logger.log({
        msg: 'Pagamento processado com sucesso',
        action: 'processPayment',
        pagamentoId: novoPagamento.pagamentoId,
        pedidoId: pedidoId,
      });
      return novoPagamento;
    } catch (error) {
      this.paymentsProcessedCounter.inc({ status: 'failure' });

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error({
        msg: 'Falha ao processar pagamento',
        action: 'processPayment',
        pedidoId: pedidoId,
        error: errorMessage,
      });
      throw error;
    }
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
        pagamentoId: payment.pagamentoId,
      });
    }

    return payment;
  }
}
