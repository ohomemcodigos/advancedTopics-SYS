/* eslint-disable */
import { io, Socket } from 'socket.io-client';
import axios, { AxiosResponse } from 'axios';

const ORDER_API = 'http://localhost:5002';
const WS_URL = 'http://localhost:5002/hubs/pedidos';

interface TokenResponse {
  token: string;
}

interface OrderCreationResponse {
  id: string;
  userId: string;
  jogosIds: string[];
  metodoPagamento: string;
  valorTotal: number;
  status: string;
}

interface StatusUpdateNotification {
  pedidoId: string;
  novoStatus: string;
  alteradoEm: string;
}

function aguardarEvento<T>(
  socket: Socket,
  evento: string,
  timeoutMs = 8000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer: NodeJS.Timeout = setTimeout(() => {
      reject(
        new Error(`Timeout: evento "${evento}" não chegou em ${timeoutMs}ms`),
      );
    }, timeoutMs);

    socket.once(evento, (data: T) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

async function rodarTeste(): Promise<void> {
  console.log('\nIniciando teste de integração WebSocket...\n');

  console.log('Etapa 0: Obtendo Token JWT de teste...');
  const tokenRes: AxiosResponse<TokenResponse> = await axios.get<TokenResponse>(
    `${ORDER_API}/orders/auth/mock-token`,
  );
  const token: string = tokenRes.data.token;
  console.log('   ✅ Token obtido!\n');

  console.log('Etapa 1: Criando pedido via POST /orders...');
  const respostaCriacao: AxiosResponse<OrderCreationResponse> =
    await axios.post<OrderCreationResponse>(`${ORDER_API}/orders`, {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      jogosIds: ['aaa00000-0000-0000-0000-000000000001'],
      metodoPagamento: 'PIX',
    });

  const pedido: OrderCreationResponse = respostaCriacao.data;
  const pedidoId: string = pedido?.id ?? '';

  console.log(`   ✅ Pedido criado com sucesso! ID: ${pedidoId}\n`);

  console.log('Etapa 2: Conectando cliente WebSocket com JWT...');
  const socket: Socket = io(WS_URL, {
    transports: ['websocket'],
    auth: { token },
  });

  await new Promise<void>((resolve, reject) => {
    socket.on('connect', () => {
      console.log(
        `   ✅ WebSocket autenticado e conectado! Socket ID: ${socket.id}\n`,
      );
      resolve();
    });

    socket.on('connect_error', (err: Error) => {
      reject(new Error(`Falha de JWT ou Conexão: ${err.message}`));
    });

    setTimeout(() => reject(new Error('Timeout na conexão WebSocket')), 5000);
  });

  console.log(`Etapa 3: Assinando pedido ${pedidoId}...`);
  socket.emit('AssinarPedido', pedidoId);

  await aguardarEvento<unknown>(socket, 'AssinaturaConfirmada');
  console.log(`   ✅ Assinatura confirmada pelo servidor!\n`);

  console.log(`Etapa 4: Confirmando pagamento via PATCH...`);
  const promessaNotificacao: Promise<StatusUpdateNotification> =
    aguardarEvento<StatusUpdateNotification>(socket, 'StatusAtualizado', 10000);

  await axios.patch(`${ORDER_API}/orders/${pedidoId}/confirmar`);
  console.log(`   ✅ Pagamento confirmado via HTTP!\n`);

  console.log('Etapa 5: Aguardando notificação via WebSocket...');
  const notificacao: StatusUpdateNotification = await promessaNotificacao;

  console.log(
    `   ✅ Notificação recebida! Novo Status: ${notificacao?.novoStatus}\n`,
  );
  console.log(
    '✅ TESTE FINALIZADO — Percurso completo funcionando e blindado com JWT!\n',
  );

  socket.disconnect();
  process.exit(0);
}

rodarTeste().catch((err: Error) => {
  console.error(
    '\n❌ TESTE FALHOU:',
    err instanceof Error ? err.message : 'Unknown error',
  );
  process.exit(1);
});
