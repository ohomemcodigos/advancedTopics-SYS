import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoSignalRService } from './pedido-signalr.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .main-wrapper { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1e1e2e; color: #cdd6f4; padding: 20px; min-height: 100vh; }
    .container { max-width: 800px; margin: 0 auto; }
    h1, h2 { color: #89b4fa; text-align: center; }
    .aviso-cors { background-color: #f38ba8; color: #11111b; padding: 10px; text-align: center; border-radius: 4px; font-weight: bold; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .card { background-color: #313244; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid transparent; transition: 0.3s; }
    .card:hover { border-color: #89b4fa; }
    .card h3 { margin: 10px 0 5px 0; font-size: 1.1rem; }
    .card p { color: #a6e3a1; font-weight: bold; margin-bottom: 15px; }
    button { background-color: #89b4fa; color: #11111b; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%; transition: 0.2s;}
    button:hover { background-color: #74c7ec; }
    button:disabled { background-color: #585b70; cursor: not-allowed; }
    .painel-pedido { background-color: #313244; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #89b4fa; }
    .log-box { background-color: #11111b; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 13px; height: 250px; overflow-y: auto; color: #a6adc8; white-space: pre-wrap; margin-top: 20px; }
    #btn-pagar { background-color: #fab387; margin-top: 15px;}
    #btn-pagar:hover:not(:disabled) { background-color: #f9a06f; }
  `],
  template: `
    <div class="main-wrapper">
      <div class="container">
        <h1>Simulação de Vendas (Angular)</h1>
        
        <div *ngIf="avisoCors" class="aviso-cors">
          ⚠️ Catálogo inacessível (Erro de CORS ou Porta). Será carregado vitrine de Simulação.
        </div>

        <h2>Vitrine de Jogos</h2>
        <div class="grid">
          <p *ngIf="jogos.length === 0" style="text-align: center; width: 100%;">Carregando dados...</p>

          <div class="card" *ngFor="let jogo of jogos">
            <h3>{{ jogo.titulo }}</h3>
            <p>BRL {{ jogo.preco.toFixed(2) }}</p>
            <button (click)="comprarJogo(jogo.id)" [disabled]="pedidoEmAndamento">Comprar (POST)</button>
          </div>
        </div>

        <div class="painel-pedido" *ngIf="pedidoIdAtual">
          <h2>Acompanhamento do Pedido (via WebSocket)</h2>
          <div style="font-size: 1.2rem; text-align: center; margin-bottom: 10px;" 
               [style.color]="signalrService.statusPedido() === 'CONFIRMADO' ? '#a6e3a1' : '#f38ba8'">
            Status: {{ signalrService.statusPedido() }}
          </div>
          
          <button id="btn-pagar" (click)="simularPagamento()" [disabled]="btnPagarDisabled || !signalrService.estaConectado()">
            3. Pagamento (RabbitMQ)
          </button>
          
          <div class="log-box">
            <div>Logs do Sistema:</div>
            <div>-------------------</div>
            <div *ngFor="let log of signalrService.logsDoSistema()">{{ log }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  // Lógica de Componente
  signalrService = inject(PedidoSignalRService);

  jogos: any[] = [];
  avisoCors = false;
  pedidoIdAtual: string | null = null;
  pedidoEmAndamento = false;
  btnPagarDisabled = true;

  // Equivalente ao "window.onload"
  async ngOnInit() {
    try {
      const response = await fetch('http://localhost:5000/jogos');
      if (!response.ok) throw new Error("Falha na API");
      const dados = await response.json();

      if (dados.length === 0) throw new Error("Vazio");

      // Mapeia os dados reais
      this.jogos = dados.map((j: any) => ({
        id: j.jogoId,
        titulo: j.titulo,
        preco: j.preco.valor
      }));
    } catch (error) {
      // Plano B: Simulação
      this.avisoCors = true;
      this.jogos = [
        { id: 'aaa00000-0000-0000-0000-000000000001', titulo: 'God of War (Simulado)', preco: 199.90 },
        { id: 'bbb00000-0000-0000-0000-000000000002', titulo: 'Hollow Knight (Simulado)', preco: 49.90 }
      ];
    }
  }

  async comprarJogo(jogoId: string) {
    this.pedidoEmAndamento = true;
    this.signalrService.registrarLog(`POST /orders para o jogo ID: ${jogoId}`);

    try {
      const response = await fetch('http://localhost:5002/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          jogosIds: [jogoId],
          metodoPagamento: 'PIX',
        })
      });

      const pedido = await response.json();
      this.pedidoIdAtual = pedido.id;
      
      this.signalrService.registrarLog(`✅ Pedido Criado! ID: ${this.pedidoIdAtual}`);
      this.signalrService.statusPedido.set(pedido.status);

      // Conecta o WebSocket enviando o ID
      await this.signalrService.conectarAoHub(this.pedidoIdAtual!);
      this.btnPagarDisabled = false;

    } catch (error: any) {
      this.signalrService.registrarLog(`❌ Erro crítico ao criar pedido: ${error.message}`);
      this.pedidoEmAndamento = false;
    }
  }

  async simularPagamento() {
    if (!this.pedidoIdAtual) return;
    try {
      this.btnPagarDisabled = true;
      this.signalrService.registrarLog("PATCH /orders/.../confirmar simulando o Pagamento...");

      const response = await fetch(`http://localhost:5002/orders/${this.pedidoIdAtual}/confirmar`, {
        method: 'PATCH'
      });

      if (response.ok) {
        this.signalrService.registrarLog("✅ Requisição HTTP concluída. Aguardando o Payment-Service...");
      }

    } catch (error: any) {
      this.signalrService.registrarLog(`❌ Erro ao enviar pagamento: ${error.message}`);
      this.btnPagarDisabled = false;
    }
  }
}