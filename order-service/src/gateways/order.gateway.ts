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
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

interface JwtPayload {
  userId?: string;
  sub?: string;
}

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

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        throw new UnauthorizedException('Token não fornecido');
      }

      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'senha_doida_uaulegauuuu_567364537@#@'
      });
      
      client.data = { user: payload };
      
      console.log(`[WebSocket] Cliente autenticado conectado: ${client.id} (User ID: ${payload.userId || payload.sub || 'Desconhecido'})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`[WebSocket] Conexão recusada para ${client.id}`);
      console.log(`[WebSocket] Motivo real: ${errorMessage}`);
      console.log(`[WebSocket] Token que chegou: ${client.handshake.auth?.token ? 'Veio um token!' : 'Nenhum token (Vazio/Null)'}`);
      client.disconnect(); 
    }
  }

  handleDisconnect(client: Socket): void {
    console.log(`[WebSocket] Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('AssinarPedido')
  async handleAssinarPedido(
    @MessageBody() pedidoId: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const grupo = `pedido_${pedidoId}`;
    await client.join(grupo);
    console.log(`[WebSocket] Cliente ${client.id} entrou no grupo: ${grupo}`);
    client.emit('AssinaturaConfirmada', { pedidoId, status: 'Conectado' });
  }

  notificarStatusAlterado(pedidoId: string, statusAtualizado: any): void {
    const grupo = `pedido_${pedidoId}`;
    this.server.to(grupo).emit('StatusAtualizado', statusAtualizado);
  }
}