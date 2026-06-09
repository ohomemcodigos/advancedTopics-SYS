import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PedidoSignalRService } from './pedido-signalr.service';

interface Jogo { id: string; titulo: string; preco: number; imagem: string; }
interface Usuario { id: string; nome: string; email: string; tipoPerfil: string; }
interface Pedido { id: string; userId: string; jogosIds?: string[]; metodoPagamento: string; status?: string; }
interface ChaveAtivacao { pedidoId: string; jogo: Jogo; statusPagamento: string; codigo: string; foiAtivada: boolean; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  visaoAtual: 'LOGIN' | 'STORE' | 'LIBRARY' | 'PROFILE' | 'ADMIN_USERS' | 'ADMIN_HISTORY' = 'LOGIN';
  usuarioLogado: Usuario | null = null;
  
  jogos: Jogo[] = [];
  jogosComprados: Jogo[] = []; 
  chavesAdquiridas: ChaveAtivacao[] = []; 
  usuariosCadastrados: Usuario[] = [];
  usuarioSelecionadoAdmin: Usuario | null = null;
  
  historicoPedidos: Pedido[] = [];

  loginEmail = '';
  loginSenha = '';
  regNome = '';
  regEmail = '';
  regSenha = '';

  modalAberto = false;
  jogoSelecionado: Jogo | null = null;
  metodoPagamentoSelecionado: 'PIX' | 'CARTAO' | 'BOLETO' = 'PIX';
  processandoPagamento = false;
  pagamentoConcluido = false;

  // Sistema de Alertas Dinâmico (Toast)
  toastVisivel = false;
  toastMensagem = '';
  toastTipo: 'erro' | 'sucesso' = 'erro';

  private http = inject(HttpClient);
  public signalR = inject(PedidoSignalRService);

  ngOnInit() {
    this.buscarCatalogo();
    this.verificarSessao();
  }

  mostrarToast(mensagem: string, tipo: 'erro' | 'sucesso' = 'erro') {
    this.toastMensagem = mensagem;
    this.toastTipo = tipo;
    this.toastVisivel = true;
    setTimeout(() => this.toastVisivel = false, 4000); 
  }

  verificarSessao() {
    const sessaoSalva = localStorage.getItem('usuarioSessao');
    if (sessaoSalva) {
      this.usuarioLogado = JSON.parse(sessaoSalva);
      this.redirecionarPorPerfil();
    }
  }

  fazerLogin() {
    // Validação específica e separada
    if (!this.loginEmail) {
      this.mostrarToast('Por favor, informe seu e-mail corporativo.', 'erro');
      return;
    }
    if (!this.loginSenha) {
      this.mostrarToast('Por favor, informe sua senha de acesso.', 'erro');
      return;
    }

    if (this.loginEmail === 'admin@admin.com' && this.loginSenha === 'admin123') {
      this.usuarioLogado = { id: 'admin-000', nome: 'Administrador Master', email: 'admin@admin.com', tipoPerfil: 'ADMIN' };
      localStorage.setItem('usuarioSessao', JSON.stringify(this.usuarioLogado));
      this.signalR.registrarLog('[Auth] Acesso Administrativo concedido.');
      this.redirecionarPorPerfil();
      return;
    }

    this.http.get<any[]>('http://localhost:3004/users').subscribe({
      next: (data) => {
        const usuarioEncontrado = data.find(u => u.credenciais?.email === this.loginEmail);
        if (usuarioEncontrado) {
          // Em um backend real o bcrypt validaria a senha. Aqui validamos local para experiência
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
          this.mostrarToast('Conta não encontrada ou credenciais inválidas.', 'erro');
        }
      },
      error: () => this.mostrarToast('Serviço de autenticação temporariamente indisponível.', 'erro')
    });
  }

  cadastrarUsuario() {
    if (!this.regNome || !this.regEmail || !this.regSenha) {
      this.mostrarToast('Preencha todos os campos para criar a conta.', 'erro');
      return;
    }

    if (this.regSenha.length < 6) {
      this.mostrarToast('Por segurança, a senha deve ter pelo menos 6 caracteres.', 'erro');
      return;
    }

    const payload = { 
      nome: this.regNome, 
      email: this.regEmail,
      senha: this.regSenha,
      nickname: this.regNome.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 1000),
      avatarUrl: 'https://placehold.co/100x100/1e1e2e/a688fa?text=U',
      pais: 'Brasil',
      tipoPerfil: 'CLIENTE'
    };
    
    this.http.post<any>('http://localhost:3004/users', payload).subscribe({
      next: () => {
        this.mostrarToast('Conta corporativa criada com sucesso!', 'sucesso');
        this.loginEmail = this.regEmail;
        this.loginSenha = this.regSenha;
        this.fazerLogin();
      },
      error: (err: HttpErrorResponse) => {
        const mensagem = err.error?.message || 'Falha ao conectar com a API de usuários.';
        this.mostrarToast(mensagem, 'erro');
      }
    });
  }

  fazerLogout() {
    this.usuarioLogado = null;
    this.jogosComprados = [];
    this.chavesAdquiridas = [];
    localStorage.removeItem('usuarioSessao');
    this.visaoAtual = 'LOGIN';
  }

  redirecionarPorPerfil() {
    this.navegarPara(this.usuarioLogado?.tipoPerfil === 'ADMIN' ? 'ADMIN_USERS' : 'STORE');
  }

  navegarPara(aba: 'STORE' | 'LIBRARY' | 'PROFILE' | 'ADMIN_USERS' | 'ADMIN_HISTORY') {
    this.visaoAtual = aba;
    if (aba === 'ADMIN_USERS') this.buscarTodosUsuarios();
    else if (aba === 'ADMIN_HISTORY') this.buscarHistoricoGlobal();
    else if (aba === 'PROFILE' || aba === 'LIBRARY') this.buscarDadosDoUsuario();
  }

  buscarCatalogo() {
    this.http.get<Jogo[]>('http://localhost:3001/api/v1/jogos').subscribe({
      next: (data) => this.jogos = data,
      error: () => this.mostrarToast('Catálogo de jogos indisponível.', 'erro')
    });
  }

  abrirModalCompra(jogo: Jogo) {
    this.jogoSelecionado = jogo;
    this.modalAberto = true;
    this.processandoPagamento = false;
    this.pagamentoConcluido = false;
  }

  fecharModal() {
    this.modalAberto = false;
    this.jogoSelecionado = null;
  }

  confirmarCompra() {
    if (!this.usuarioLogado || !this.jogoSelecionado) return;
    this.processandoPagamento = true;

    const payload = {
      userId: this.usuarioLogado.id,
      jogosIds: [this.jogoSelecionado.id],
      metodoPagamento: this.metodoPagamentoSelecionado
    };

    this.http.post<any>('http://localhost:3002/orders', payload).subscribe({
      next: (pedido) => {
        setTimeout(() => {
          this.pagamentoConcluido = true;
          this.signalR.conectarAoHub(pedido.id || pedido.pedidoId);
          setTimeout(() => {
            this.fecharModal();
            this.mostrarToast('Licença adquirida! Verifique seu inventário.', 'sucesso');
            this.navegarPara('PROFILE'); 
          }, 2000);
        }, 1500);
      },
      error: () => {
        this.processandoPagamento = false;
        this.mostrarToast('Falha na comunicação com o Gateway de Pagamentos.', 'erro');
      }
    });
  }

  mapearPedido(raw: any): Pedido {
    let idsJogosExtraidos: string[] = [];
    if (raw.jogosIds && Array.isArray(raw.jogosIds)) idsJogosExtraidos = raw.jogosIds;
    else if (raw.itens && Array.isArray(raw.itens)) idsJogosExtraidos = raw.itens.map((i: any) => i.jogoId || i.produtoId || i.id);
    else if (raw.jogoId) idsJogosExtraidos = [raw.jogoId];

    let statusFinal = raw.status || raw.estado || raw.statusPagamento || 'APROVADO';
    if (statusFinal === 'PENDING' || statusFinal === 'PROCESSANDO') statusFinal = 'APROVADO'; 

    return {
      id: raw.id || raw.pedidoId || raw._id || 'ID-DESCONHECIDO',
      userId: raw.userId || raw.usuarioId || raw.clienteId || 'USER-DESCONHECIDO',
      jogosIds: idsJogosExtraidos,
      metodoPagamento: raw.metodoPagamento || raw.formaPagamento || 'INDEFINIDO',
      status: statusFinal
    };
  }

  buscarDadosDoUsuario() {
    if (!this.usuarioLogado) return;
    
    const ativadasSalvas: string[] = JSON.parse(localStorage.getItem('chavesAtivadas_' + this.usuarioLogado.id) || '[]');
    
    this.http.get<any>(`http://localhost:3002/orders/user/${this.usuarioLogado.id}`).subscribe({
      next: (respostaBruta) => {
        const listaBruta = Array.isArray(respostaBruta) ? respostaBruta : (respostaBruta.data || respostaBruta.pedidos || []);
        this.historicoPedidos = listaBruta.map((item: any) => this.mapearPedido(item));

        this.chavesAdquiridas = [];
        this.jogosComprados = [];
        const idsNaBiblioteca = new Set<string>();

        this.historicoPedidos.forEach(p => {
          const pagamentoAprovado = p.status === 'APROVADO' || p.status === 'CONFIRMADO';

          if (p.jogosIds && Array.isArray(p.jogosIds)) {
            p.jogosIds.forEach(jogoId => {
              const jogoRef = this.jogos.find(j => j.id === jogoId);
              if (jogoRef) {
                const codigoChave = this.gerarChaveDeterministica(p.id, jogoId);
                const isAtivada = ativadasSalvas.includes(codigoChave);

                this.chavesAdquiridas.push({
                  pedidoId: p.id, jogo: jogoRef, statusPagamento: p.status || 'APROVADO',
                  codigo: pagamentoAprovado ? codigoChave : 'AGUARDANDO', foiAtivada: isAtivada
                });

                if (isAtivada && !idsNaBiblioteca.has(jogoId)) {
                  idsNaBiblioteca.add(jogoId);
                  this.jogosComprados.push(jogoRef);
                }
              }
            });
          }
        });
      },
      error: () => this.mostrarToast('Falha ao carregar os dados de pedidos do usuário.', 'erro')
    });
  }

  gerarChaveDeterministica(pedidoId: string, jogoId: string): string {
    const pStr = pedidoId.substring(0, 4).toUpperCase();
    const jStr = jogoId.substring(0, 4).toUpperCase();
    let hash = 0;
    for (let i = 0; i < pedidoId.length; i++) hash = pedidoId.charCodeAt(i) + ((hash << 5) - hash);
    const num = Math.abs(hash % 9000) + 1000;
    return `${pStr}-${jStr}-${num}`;
  }

  ativarChave(chave: ChaveAtivacao) {
    if (!this.usuarioLogado) return;

    const jaPossui = this.jogosComprados.some(j => j.id === chave.jogo.id);
    if (jaPossui) {
      this.mostrarToast(`Você já possui o jogo ${chave.jogo.titulo} ativo!`, 'erro');
      return;
    }

    chave.foiAtivada = true;
    this.jogosComprados.push(chave.jogo);
    
    const ativadasSalvas: string[] = JSON.parse(localStorage.getItem('chavesAtivadas_' + this.usuarioLogado.id) || '[]');
    ativadasSalvas.push(chave.codigo);
    localStorage.setItem('chavesAtivadas_' + this.usuarioLogado.id, JSON.stringify(ativadasSalvas));

    this.mostrarToast(`${chave.jogo.titulo} ativado e enviado para sua Biblioteca!`, 'sucesso');
  }

  buscarHistoricoGlobal() {
    this.http.get<any>('http://localhost:3002/orders').subscribe({
      next: (respostaBruta) => {
        const listaBruta = Array.isArray(respostaBruta) ? respostaBruta : (respostaBruta.data || respostaBruta.pedidos || []);
        this.historicoPedidos = listaBruta.map((item: any) => this.mapearPedido(item));
      },
      error: () => this.mostrarToast('Falha ao recuperar histórico global do servidor.', 'erro')
    });
  }

  buscarTodosUsuarios() {
    this.http.get<any[]>('http://localhost:3004/users').subscribe({
      next: (data) => {
        this.usuariosCadastrados = data.map(u => ({
          id: u.usuarioId, nome: u.perfil?.nome, email: u.credenciais?.email, tipoPerfil: u.tipoPerfil
        }));
      },
      error: () => this.mostrarToast('Conexão perdida com o banco de usuários.', 'erro')
    });
  }

  selecionarUsuario(usuario: Usuario) {
    this.usuarioSelecionadoAdmin = usuario;
  }

  apagarUsuario(id: string) {
    if (!this.usuarioLogado || !this.usuarioSelecionadoAdmin) return;
    const adminNome = this.usuarioSelecionadoAdmin.nome;
    const headers = new HttpHeaders().set('x-role', this.usuarioLogado.tipoPerfil);
    
    this.http.delete(`http://localhost:3004/users/${id}`, { headers }).subscribe({
      next: () => {
        this.signalR.registrarLog(`[Admin] Sucesso: Conta de ${adminNome} excluída.`);
        this.mostrarToast(`Conta de ${adminNome} removida do sistema.`, 'sucesso');
        this.usuarioSelecionadoAdmin = null;
        this.buscarTodosUsuarios();
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.message || 'Sem permissão para remover usuário.';
        this.mostrarToast(`Ação negada: ${msg}`, 'erro');
      }
    });
  }

  obterNomeJogo(pedido: Pedido): string {
    if (!pedido || !pedido.jogosIds || !Array.isArray(pedido.jogosIds) || pedido.jogosIds.length === 0) {
      return 'Pacote Desconhecido';
    }
    const jogo = this.jogos.find(j => j.id === pedido.jogosIds![0]);
    return jogo ? jogo.titulo : 'ID: ' + pedido.jogosIds![0].substring(0, 8);
  }
}