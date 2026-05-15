import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/hubs/pedidos',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`[WebSocket] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('AssinarPedido')
  async handleAssinarPedido(
    @MessageBody() pedidoId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const grupo = `pedido_${pedidoId}`;
    await client.join(grupo);
    console.log(`[WebSocket] Cliente ${client.id} entrou no grupo: ${grupo}`);
    client.emit('AssinaturaConfirmada', { pedidoId, status: 'Conectado' });
  }

  notificarStatusAlterado(pedidoId: string, statusAtualizado: any) {
    const grupo = `pedido_${pedidoId}`;
    this.server.to(grupo).emit('StatusAtualizado', statusAtualizado);
  }
}