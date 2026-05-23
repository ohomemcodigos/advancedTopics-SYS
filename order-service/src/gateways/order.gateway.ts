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
import { JwtService } from '@nestjs/jwt'; // Importação adicionada
import { UnauthorizedException } from '@nestjs/common'; // Importação adicionada

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

  // Construtor injetando o serviço de validação do JWT
  constructor(private readonly jwtService: JwtService) {}

  // Método refatorado para ser assíncrono e validar a entrada
  async handleConnection(client: Socket) {
    try {
      // Procura o token no handshake de autenticação ou no header Authorization
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        throw new UnauthorizedException('Token não fornecido');
      }

      // Valida o token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'senha_doida_uaulegauuuu_567364537@#@'
      });
      
      // Guarda os dados do usuário para uso posterior, se necessário
      client.data = { user: payload };
      
      console.log(`[WebSocket] Cliente autenticado conectado: ${client.id} (User ID: ${payload.userId || payload.sub || 'Desconhecido'})`);
    } catch (error: any) {
      console.log(`[WebSocket] Conexão recusada para ${client.id}`);
      console.log(`[WebSocket] Motivo real: ${error.message}`);
      console.log(`[WebSocket] Token que chegou: ${client.handshake.auth?.token ? 'Veio um token!' : 'Nenhum token (Vazio/Null)'}`);
      client.disconnect(); 
    }
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