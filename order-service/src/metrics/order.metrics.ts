import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

// Contador: Total de pedidos criados
export const ordersCreatedCounter = makeCounterProvider({
  name: 'gestaopedidos_pedidos_criados_total',
  help: 'Total de pedidos criados na plataforma.',
  labelNames: ['status'],
});

// Histogram: Latência de criação de pedido
export const ordersCreationDuration = makeHistogramProvider({
  name: 'gestaopedidos_pedido_criacao_duracao_segundos',
  help: 'Duração do fluxo de criação de pedido em segundos.',
  buckets: [0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
});