import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const ORDER_API = 'http://localhost:5002';
const WS_URL = 'http://localhost:5002/hubs/pedidos';

function aguardarEvento(socket: Socket, evento: string, timeoutMs = 8000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: evento "${evento}" não chegou em ${timeoutMs}ms`));
    }, timeoutMs);
    socket.once(evento, (data: any) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

async function rodarTeste() {
  console.log('\n🧪 Iniciando teste de integração WebSocket...\n');

  // Obtem o token de teste
  console.log('🔑 Passo 0: Obtendo Token JWT de teste...');
  const tokenRes = await axios.get(`${ORDER_API}/orders/auth/mock-token`);
  const token = tokenRes.data.token;
  console.log('   ✅ Token obtido!\n');

  console.log('📦 Passo 1: Criando pedido via POST /orders...');
  const respostaCriacao = await axios.post(`${ORDER_API}/orders`, {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    jogosIds: ['aaa00000-0000-0000-0000-000000000001'],
    metodoPagamento: 'PIX',
  });

  const pedido = respostaCriacao.data;
  const pedidoId: string = (pedido as any).id;

  console.log(`   ✅ Pedido criado com sucesso! ID: ${pedidoId}\n`);

  console.log('🔌 Passo 2: Conectando cliente WebSocket com JWT...');
  const socket = io(WS_URL, {
    transports: ['websocket'],
    auth: { token } // O Token é enviado aqui
  });

  await new Promise<void>((resolve, reject) => {
    socket.on('connect', () => {
      console.log(`   ✅ WebSocket autenticado e conectado! Socket ID: ${socket.id}\n`);
      resolve();
    });
    socket.on('connect_error', (err) => {
      reject(new Error(`Falha de JWT ou Conexão: ${err.message}`));
    });
    setTimeout(() => reject(new Error('Timeout na conexão WebSocket')), 5000);
  });

  console.log(`📡 Passo 3: Assinando pedido ${pedidoId}...`);
  socket.emit('AssinarPedido', pedidoId);

  const confirmacao = await aguardarEvento(socket, 'AssinaturaConfirmada');
  console.log(`   ✅ Assinatura confirmada pelo servidor!\n`);

  console.log(`💳 Passo 4: Confirmando pagamento via PATCH...`);
  const promessaNotificacao = aguardarEvento(socket, 'StatusAtualizado', 10000);

  await axios.patch(`${ORDER_API}/orders/${pedidoId}/confirmar`);
  console.log(`   ✅ Pagamento confirmado via HTTP!\n`);

  console.log('⚡ Passo 5: Aguardando notificação via WebSocket...');
  const notificacao = await promessaNotificacao;

  console.log(`   ✅ Notificação recebida! Novo Status: ${notificacao.novoStatus}\n`);
  console.log('✅ TESTE PASSOU — Percurso completo funcionando e blindado com JWT!\n');

  socket.disconnect();
  process.exit(0);
}

rodarTeste().catch((err) => {
  console.error('\n❌ TESTE FALHOU:', err.message);
  process.exit(1);
});