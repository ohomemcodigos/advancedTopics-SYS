import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { retryWithBackoff } from '../utils/resilience.util';

@Injectable()
export class PaymentProxyService {
  constructor(private readonly httpService: HttpService) {}

  /*
   Método que chama o serviço de pagamentos com a estratégia de Retry
   */
  async chamarPagamento(payload: any): Promise<any> {
    // A URL deve apontar para o container de pagamento
    const url = 'http://payment-api:3000/payments';

    return await lastValueFrom(
      this.httpService.post(url, payload).pipe(
        retryWithBackoff(3, 1000), // Aplica o retry com backoff exponencial
      ),
    );
  }
}
