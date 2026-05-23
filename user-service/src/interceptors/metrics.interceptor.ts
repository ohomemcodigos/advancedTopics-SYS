import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Counter, Histogram } from 'prom-client';

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP interceptadas',
  labelNames: ['method', 'status']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    
    // Ignora chamadas assíncronas do RabbitMQ ou WebSockets que não possuem formato HTTP
    if (!req || !req.method) return next.handle();

    const method = req.method;
    const timer = httpRequestDuration.startTimer();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const status = res.statusCode ? res.statusCode.toString() : '200';
        httpRequestsTotal.inc({ method, status });
        timer({ method, status });
      }),
      catchError((err) => {
        const status = err.status ? err.status.toString() : '500';
        httpRequestsTotal.inc({ method, status });
        timer({ method, status });
        return throwError(() => err);
      })
    );
  }
}