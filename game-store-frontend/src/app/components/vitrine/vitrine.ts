import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PedidoSignalRService } from '../../pedido-signalr.service';
import { Jogo } from '../../models/jogo.model';

@Component({
  selector: 'app-vitrine',
  standalone: true,
  templateUrl: './vitrine.html',
  styleUrl: './vitrine.css'
})
export class VitrineComponent implements OnInit {
  signalrService = inject(PedidoSignalRService);
  http = inject(HttpClient);

  jogos: Jogo[] = [];
  avisoCors = false;
  pedidoIdAtual: string | null = null;
  pedidoEmAndamento = false;
  btnPagarDisabled = true;
  mostrarPainel = false;

  ngOnInit() {
    this.http.get<any[]>('/api/catalog/jogos').subscribe({
      next: (dados) => {
        if (!dados || dados.length === 0) {
          this.carregarMock();
          return;
        }
        this.jogos = dados.map((j: any) => ({
          id: j.jogoId,
          titulo: j.titulo,
          preco: j.preco.valor,
          imagemUrl: 'https://placehold.co/400x500/2a2a2a/FFF?text=' + j.titulo.substring(0, 3)
        }));
      },
      error: () => {
        this.carregarMock();
      }
    });
  }

  carregarMock() {
    this.avisoCors = true;
    this.jogos = [
      { id: '1', titulo: "Baldur's Gate 3", preco: 199.90, imagemUrl: 'https://placehold.co/400x500/2a2a2a/FFF?text=BG3' },
      { id: '2', titulo: 'Cyberpunk 2077', preco: 159.90, imagemUrl: 'https://placehold.co/400x500/fcee0a/000?text=CP7' },
      { id: '3', titulo: 'Monster Hunter World', preco: 99.90, imagemUrl: 'https://placehold.co/400x500/1e3b4d/FFF?text=MHW' }
    ];
  }

  comprarJogo(jogoId: string) {
    this.pedidoEmAndamento = true;
    this.mostrarPainel = true;
    this.signalrService.registrarLog(`POST /api/orders/orders para o jogo ID: ${jogoId}`);

    this.http.post<any>('/api/orders/orders', {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      jogosIds: [jogoId],
      metodoPagamento: 'PIX',
    }).subscribe({
      next: async (pedido) => {
        this.pedidoIdAtual = pedido.id;
        this.signalrService.registrarLog(`✅ Pedido Criado! ID: ${this.pedidoIdAtual}`);
        this.signalrService.statusPedido.set(pedido.status);

        await this.signalrService.conectarAoHub(this.pedidoIdAtual!);
        this.btnPagarDisabled = false;
      },
      error: (err) => {
        this.signalrService.registrarLog(`❌ API Offline. Iniciando simulação local...`);
        this.pedidoIdAtual = 'simulado-' + Math.floor(Math.random() * 10000);
        this.signalrService.registrarLog(`✅ [MOCK] Pedido Criado! ID: ${this.pedidoIdAtual}`);
        this.signalrService.statusPedido.set('CRIADO_SIMULACAO');
        this.btnPagarDisabled = false;
      }
    });
  }

  simularPagamento() {
    if (!this.pedidoIdAtual) return;
    this.btnPagarDisabled = true;
    this.signalrService.registrarLog(`PATCH /api/orders/orders/${this.pedidoIdAtual}/confirmar simulando o Pagamento...`);

    this.http.patch(`/api/orders/orders/${this.pedidoIdAtual}/confirmar`, {}).subscribe({
      next: () => {
        this.signalrService.registrarLog("✅ Requisição HTTP concluída. Aguardando processamento...");
      },
      error: (err) => {
        this.signalrService.registrarLog(`❌ API Offline. Simulando pagamento localmente...`);
        setTimeout(() => {
          this.signalrService.registrarLog("✅ [MOCK] Pagamento Confirmado com Sucesso!");
          this.signalrService.statusPedido.set('PAGO_SIMULACAO');
        }, 1500);
      }
    });
  }
}