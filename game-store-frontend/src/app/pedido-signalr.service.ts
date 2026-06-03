import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class PedidoSignalRService {
  private socket!: Socket;
  private readonly ORDER_API = 'http://localhost:5002';
  private readonly WS_URL = 'http://localhost:5002/hubs/pedidos';

  // --- Uso de Angular Signals ---
  public statusPedido = signal<string>('Aguardando Ação');
  public logsDoSistema = signal<string[]>([]);
  public estaConectado = signal<boolean>(false);

  constructor() {}

  public async conectarAoHub(pedidoId: string): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
    }

    try {
      this.registrarLog('🔑 Buscando Token JWT no backend...');
      const response = await fetch(`${this.ORDER_API}/orders/auth/mock-token`);
      const data = await response.json();
      const token = data.token;

      // --- Reconexão Automática configurada ---
      this.socket = io(this.WS_URL, {
        transports: ['websocket'],
        auth: { token: token },
        reconnection: true,         // Reconexão
        reconnectionAttempts: 5,
        reconnectionDelay: 2000
      });

      this.socket.on('connect', () => {
        this.estaConectado.set(true);
        this.registrarLog(`🔌 Conectado ao WebSocket! (ID: ${this.socket.id})`);
        this.registrarLog(`📡 Assinando grupo do pedido: ${pedidoId}`);
        this.socket.emit('AssinarPedido', pedidoId);
      });

      this.socket.on('AssinaturaConfirmada', () => {
        this.registrarLog(`✅ Sala do pedido assinada no backend.`);
      });

      this.socket.on('StatusAtualizado', (data: any) => {
        this.statusPedido.set(data.novoStatus);
        this.registrarLog(`NOTIFICAÇÃO REAL-TIME: Status -> [${data.novoStatus}]`);
      });

      this.socket.on('connect_error', (error) => {
        this.estaConectado.set(false);
        this.registrarLog(`❌ Erro de Conexão: ${error.message}`);
      });

    } catch (err: any) {
      this.registrarLog(`❌ Erro ao buscar token: ${err.message}`);
    }
  }

  public registrarLog(mensagem: string): void {
    console.log(mensagem);
    // Atualiza o array de logs usando o Signal
    this.logsDoSistema.update(logs => [...logs, `> ${mensagem}`]);
  }
}