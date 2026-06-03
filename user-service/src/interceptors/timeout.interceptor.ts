import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(5000), // Define limite de 5 segundos para a requisição
      catchError((err: unknown) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                'Tempo de requisição esgotado. Tente novamente mais tarde.',
              ),
          );
        }
        return throwError(() => err as Error);
      }),
    );
  }
}
