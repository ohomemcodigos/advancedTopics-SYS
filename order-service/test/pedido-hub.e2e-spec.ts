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

  console.log('📦 Passo 1: Criando pedido via POST /orders...');
  const respostaCriacao = await axios.post(`${ORDER_API}/orders`, {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    jogosIds: ['aaa00000-0000-0000-0000-000000000001'],
    metodoPagamento: 'PIX',
  });

  const pedido = respostaCriacao.data;
  const pedidoId: string = (pedido as any).id;

  console.log(`   ✅ Pedido criado com sucesso!`);
  console.log(`   ID: ${pedidoId}`);
  console.log(`   Status: ${(pedido as any).status}\n`);

  console.log('🔌 Passo 2: Conectando cliente WebSocket em /hubs/pedidos...');
  const socket = io(WS_URL, {
    transports: ['websocket'],
  });

  await new Promise<void>((resolve, reject) => {
    socket.on('connect', () => {
      console.log(`   ✅ WebSocket conectado! Socket ID: ${socket.id}\n`);
      resolve();
    });
    socket.on('connect_error', (err) => {
      reject(new Error(`Falha ao conectar WebSocket: ${err.message}`));
    });
    setTimeout(() => reject(new Error('Timeout na conexão WebSocket')), 5000);
  });

  console.log(`📡 Passo 3: Assinando pedido ${pedidoId}...`);
  socket.emit('AssinarPedido', pedidoId);

  const confirmacao = await aguardarEvento(socket, 'AssinaturaConfirmada');
  console.log(`   ✅ Assinatura confirmada pelo servidor!`);
  console.log(`   Resposta: ${JSON.stringify(confirmacao)}\n`);

  console.log(`💳 Passo 4: Confirmando pagamento via PATCH /orders/${pedidoId}/confirmar...`);
  const promessaNotificacao = aguardarEvento(socket, 'StatusAtualizado', 10000);

  const respostaConfirmacao = await axios.patch(`${ORDER_API}/orders/${pedidoId}/confirmar`);
  console.log(`   ✅ Pagamento confirmado via HTTP!`);
  console.log(`   Status retornado: ${(respostaConfirmacao.data as any)?.order?.status ?? respostaConfirmacao.status}\n`);

  console.log('⚡ Passo 5: Aguardando notificação em tempo real via WebSocket...');
  const notificacao = await promessaNotificacao;

  console.log(`   ✅ Notificação recebida via WebSocket!`);
  console.log(`   Dados: ${JSON.stringify(notificacao, null, 2)}\n`);

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ TESTE PASSOU — Percurso completo funcionando!');
  console.log('   POST /orders         → Pedido criado');
  console.log('   WebSocket connect    → Cliente conectado em /hubs/pedidos');
  console.log('   emit AssinarPedido   → Grupo assinado');
  console.log('   PATCH /confirmar     → Pagamento confirmado');
  console.log('   on StatusAtualizado  → Notificação em tempo real recebida ✔');
  console.log('═══════════════════════════════════════════════════════\n');

  socket.disconnect();
  process.exit(0);
}

rodarTeste().catch((err) => {
  console.error('\n❌ TESTE FALHOU:', err.message);
  process.exit(1);
});