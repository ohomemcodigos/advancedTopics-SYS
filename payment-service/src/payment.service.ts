// Substitua os imports errados por este:
import { Injectable, BadRequestException } from '@nestjs/common';
import { Pagamento } from './domain/pagamento/entidades/pagamento.entity';
import { MetodoPagamento } from './domain/pagamento/objetos_de_valor/metodo_pagamento.vo';
import { Dinheiro } from './domain/pagamento/objetos_de_valor/dinheiro.vo';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentService {
  private payments: Pagamento[] = [];

  // Ajuste o método para usar a entidade Pagamento que você já tem
  processPayment(pedidoId: string, valor: number, tipo: any): Pagamento {
    const valorTotal = new Dinheiro(valor);
    const metodo = new MetodoPagamento(tipo, 'Detalhes da transação');
    
    const novoPagamento = new Pagamento(
      randomUUID(),
      pedidoId,
      valorTotal,
      metodo
    );

    this.payments.push(novoPagamento);
    return novoPagamento;
  }

  getPaymentByOrder(orderId: string): Pagamento | undefined {
    return this.payments.find(p => p.pedidoId === orderId);
  }
}