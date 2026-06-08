import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PedidoSignalRService } from './pedido-signalr.service';

interface Jogo { id: string; titulo: string; preco: number; imagem: string; }
interface Usuario { id: string; nome: string; email: string; tipoPerfil: string; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  // Estado da Aplicação
  visaoAtual: 'LOGIN' | 'STORE' | 'ADMIN' = 'LOGIN';
  usuarioLogado: Usuario | null = null;
  
  // Dados
  jogos: Jogo[] = [];
  usuariosCadastrados: Usuario[] = [];
  
  // Formulários
  loginEmail = '';
  loginSenha = '';
  regNome = '';
  regEmail = '';
  regSenha = '';

  // Modal de Compra
  modalAberto = false;
  jogoSelecionado: Jogo | null = null;
  metodoPagamentoSelecionado: 'PIX' | 'CARTAO' | 'BOLETO' = 'PIX';

  private http = inject(HttpClient);
  public signalR = inject(PedidoSignalRService);

  ngOnInit() {
    this.buscarCatalogo();
    this.verificarSessao();
  }

  // --- AUTENTICAÇÃO E SESSÃO ---

  verificarSessao() {
    const sessaoSalva = localStorage.getItem('usuarioSessao');
    if (sessaoSalva) {
      this.usuarioLogado = JSON.parse(sessaoSalva);
      this.redirecionarPorPerfil();
    }
  }

  fazerLogin() {
    if (!this.loginEmail || !this.loginSenha) {
      this.signalR.registrarLog('[Auth] Preencha email e senha.');
      return;
    }

    // Em uma arquitetura real, isso chamaria um Auth-Service para validar o hash bcrypt.
    // Aqui fazemos uma validação simulada buscando o email no user-service.
    this.http.get<any[]>('http://localhost:3004/users').subscribe({
      next: (data) => {
        const usuarioEncontrado = data.find(u => u.credenciais?.email === this.loginEmail);
        
        if (usuarioEncontrado) {
          this.usuarioLogado = {
            id: usuarioEncontrado.usuarioId,
            nome: usuarioEncontrado.perfil.nome,
            email: usuarioEncontrado.credenciais.email,
            tipoPerfil: usuarioEncontrado.tipoPerfil
          };
          localStorage.setItem('usuarioSessao', JSON.stringify(this.usuarioLogado));
          this.signalR.registrarLog(`[Auth] Login efetuado: ${this.usuarioLogado.nome}`);
          this.redirecionarPorPerfil();
        } else {
          this.signalR.registrarLog('[Auth] Falha: Credenciais inválidas ou usuário não existe.');
        }
      },
      error: (err) => this.signalR.registrarLog(`[Auth Error] Falha na comunicação: ${err.message}`)
    });
  }

  cadastrarUsuario(comoAdmin: boolean = false) {
    if (!this.regNome || !this.regEmail || !this.regSenha) {
      this.signalR.registrarLog('[Auth] Preencha todos os campos para cadastro.');
      return;
    }

    const payload = { 
      nome: this.regNome, 
      email: this.regEmail,
      senha: this.regSenha,
      nickname: this.regNome.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 1000),
      avatarUrl: 'https://placehold.co/100x100/1e1e2e/a688fa?text=U',
      pais: 'Brasil',
      tipoPerfil: comoAdmin ? 'ADMIN' : 'CLIENTE'
    };
    
    this.http.post<any>('http://localhost:3004/users', payload).subscribe({
      next: (user) => {
        this.signalR.registrarLog(`[Auth] Conta criada com sucesso: ${user.perfil.nome}`);
        this.loginEmail = this.regEmail;
        this.loginSenha = this.regSenha;
        this.fazerLogin(); // Auto-login após cadastro
      },
      error: (err: HttpErrorResponse) => {
        const mensagem = err.error?.message || err.message;
        this.signalR.registrarLog(`[Cadastro Error] ${mensagem}`);
      }
    });
  }

  fazerLogout() {
    this.usuarioLogado = null;
    localStorage.removeItem('usuarioSessao');
    this.visaoAtual = 'LOGIN';
    this.loginEmail = '';
    this.loginSenha = '';
    this.signalR.registrarLog('[Auth] Logout efetuado.');
  }

  redirecionarPorPerfil() {
    if (this.usuarioLogado?.tipoPerfil === 'ADMIN') {
      this.visaoAtual = 'ADMIN';
      this.buscarTodosUsuarios();
    } else {
      this.visaoAtual = 'STORE';
    }
  }

  // --- FLUXO DE LOJA E PAGAMENTO ---

  buscarCatalogo() {
    this.http.get<Jogo[]>('http://localhost:3001/api/v1/jogos').subscribe({
      next: (data) => this.jogos = data,
      error: (err) => console.error('Erro ao conectar com o catálogo:', err)
    });
  }

  abrirModalCompra(jogo: Jogo) {
    this.jogoSelecionado = jogo;
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
    this.jogoSelecionado = null;
  }

  confirmarCompra() {
    if (!this.usuarioLogado || !this.jogoSelecionado) return;

    this.signalR.registrarLog(`[Pedido] Iniciando processamento via ${this.metodoPagamentoSelecionado}`);
    
    const payload = {
      userId: this.usuarioLogado.id,
      jogosIds: [this.jogoSelecionado.id],
      metodoPagamento: this.metodoPagamentoSelecionado
    };

    this.http.post<any>('http://localhost:3002/orders', payload).subscribe({
      next: (pedido) => {
        this.signalR.registrarLog(`[Pedido] Gerado no Backend. ID: ${pedido.id}`);
        this.signalR.conectarAoHub(pedido.id);
        this.fecharModal();
      },
      error: (err) => {
        this.signalR.registrarLog(`[Pedido Error] Falha: ${err.message}`);
        this.fecharModal();
      }
    });
  }

  // --- PAINEL ADMINISTRATIVO ---

  buscarTodosUsuarios() {
    this.http.get<any[]>('http://localhost:3004/users').subscribe({
      next: (data) => {
        this.usuariosCadastrados = data.map(u => ({
          id: u.usuarioId,
          nome: u.perfil?.nome,
          email: u.credenciais?.email,
          tipoPerfil: u.tipoPerfil
        }));
      }
    });
  }

  apagarUsuario(id: string) {
    if (!this.usuarioLogado) return;

    const headers = new HttpHeaders().set('x-role', this.usuarioLogado.tipoPerfil);

    this.http.delete(`http://localhost:3004/users/${id}`, { headers }).subscribe({
      next: () => {
        this.signalR.registrarLog(`[Admin] Usuário ${id} removido.`);
        this.buscarTodosUsuarios(); // Atualiza a lista
      },
      error: (err: HttpErrorResponse) => {
        const mensagem = err.error?.message || 'Erro ao remover';
        this.signalR.registrarLog(`[Admin Error] ${mensagem}`);
      }
    });
  }
}