import { retry, timer } from 'rxjs';

export const retryWithBackoff = (
  maxRetries: number = 3,
  initialDelay: number = 1000,
) => {
  return retry({
    count: maxRetries,
    delay: (error, retryCount) => {
      const delay = Math.pow(2, retryCount - 1) * initialDelay;
      console.log(
        `Tentativa ${retryCount} falhou. Tentando novamente em ${delay}ms...`,
      );
      return timer(delay);
    },
  });
};
