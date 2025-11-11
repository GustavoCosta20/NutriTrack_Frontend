import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RefeicaoDto } from 'src/app/models/snack.model';

interface HistoricoChat {
  data: string;
  mensagens: Array<{ texto: string, tipo: 'usuario' | 'ia', timestamp: Date }>;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // --- DADOS DE METAS 
  nomeUsuario: string = "Carregando...";
  objetivo: string = "-";
  caloriasMeta: number = 0;
  proteinasMeta: number = 0;
  carboidratosMeta: number = 0;
  gordurasMeta: number = 0;

  // --- DADOS PROGRESSO DIÁRIO ---
  caloriasConsumidas: number = 0;
  proteinasConsumidas: number = 0;
  carboidratosConsumidos: number = 0;
  gordurasConsumidas: number = 0;

  // --- REFEIÇÕES DO DIA ---
  refeicoesDeHoje: RefeicaoDto[] = [];

  dadosDoGrafico: { name: string, value: number }[] = [];
  colorScheme = {
    domain: ['#e63e28ff', '#92918dff', '#C7B42C'] 
  };

  // Propriedades do Chat
  mensagensChat: Array<{ texto: string, tipo: 'usuario' | 'ia', timestamp: Date }> = [];
  aguardandoResposta = false;
  
  // NOVO: Propriedades do histórico
  mostrarHistorico = false;
  historicoConversas: HistoricoChat[] = [];
  mostrarConfirmacao = false;
  tituloConfirmacao = '';
  mensagemConfirmacao = '';
  acaoConfirmacao: (() => void) | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.carregarDadosUsuario();
    this.carregarRefeicoesDeHoje();
    this.carregarHistoricoChat();
    this.carregarListaHistoricos();
  }

  // ==================== MÉTODOS DE HISTÓRICO ====================

  /**
   * Carrega o histórico do dia atual
   */
  private carregarHistoricoChat(): void {
    const hoje = this.obterDataAtual();
    const historicoHoje = this.obterHistoricoPorData(hoje);
    
    if (historicoHoje && historicoHoje.mensagens.length > 0) {
      this.mensagensChat = historicoHoje.mensagens.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } else {
      this.iniciarNovaConversa();
    }
  }

  /**
   * Inicia uma nova conversa
   */
  private iniciarNovaConversa(): void {
    this.mensagensChat = [
      { 
        texto: 'Olá! Sou sua assistente NutriTrack. Descreva o que você comeu. Ex: "almoço, 200g de arroz e 150g de frango"', 
        tipo: 'ia',
        timestamp: new Date()
      }
    ];
    this.salvarHistoricoChat();
  }

  /**
   * Salva o histórico do chat atual
   */
  private salvarHistoricoChat(): void {
    const hoje = this.obterDataAtual();
    const chaveStorage = this.gerarChaveStorage(hoje);
    
    const dadosParaSalvar: HistoricoChat = {
      data: hoje,
      mensagens: this.mensagensChat
    };
    
    try {
      localStorage.setItem(chaveStorage, JSON.stringify(dadosParaSalvar));
      this.atualizarListaHistoricos(hoje);
    } catch (error) {
      console.error('Erro ao salvar histórico do chat:', error);
    }
  }

  /**
   * Carrega a lista de todos os históricos salvos
   */
  private carregarListaHistoricos(): void {
    try {
      const listaHistoricos = localStorage.getItem('chatHistoricoLista');
      if (listaHistoricos) {
        const datas: string[] = JSON.parse(listaHistoricos);
        
        this.historicoConversas = datas
          .map(data => this.obterHistoricoPorData(data))
          .filter(hist => hist !== null) as HistoricoChat[];
        
        // Ordena do mais recente para o mais antigo
        this.historicoConversas.sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
      }
    } catch (error) {
      console.error('Erro ao carregar lista de históricos:', error);
    }
  }

  /**
   * Atualiza a lista de históricos com uma nova data
   */
  private atualizarListaHistoricos(novaData: string): void {
    try {
      const listaHistoricos = localStorage.getItem('chatHistoricoLista');
      let datas: string[] = listaHistoricos ? JSON.parse(listaHistoricos) : [];
      
      if (!datas.includes(novaData)) {
        datas.push(novaData);
        localStorage.setItem('chatHistoricoLista', JSON.stringify(datas));
      }
      
      this.carregarListaHistoricos();
    } catch (error) {
      console.error('Erro ao atualizar lista de históricos:', error);
    }
  }

  /**
   * Obtém histórico de uma data específica
   */
  private obterHistoricoPorData(data: string): HistoricoChat | null {
    try {
      const chave = this.gerarChaveStorage(data);
      const historico = localStorage.getItem(chave);
      return historico ? JSON.parse(historico) : null;
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      return null;
    }
  }

  /**
   * Gera a chave de storage para uma data
   */
  private gerarChaveStorage(data: string): string {
    return `chatHistorico_${data}`;
  }

  /**
   * Obtém a data atual no formato YYYY-MM-DD
   */
  private obterDataAtual(): string {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }

  /**
   * Formata a data para exibição no histórico
   */
  formatarDataHistorico(data: string): string {
    const hoje = this.obterDataAtual();
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const dataOntem = ontem.toISOString().split('T')[0];
    
    if (data === hoje) {
      return 'Hoje';
    } else if (data === dataOntem) {
      return 'Ontem';
    } else {
      const partes = data.split('-');
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
  }

  /**
   * Toggle do modal de histórico
   */
  toggleHistoricoChat(): void {
    this.mostrarHistorico = !this.mostrarHistorico;
    if (this.mostrarHistorico) {
      this.carregarListaHistoricos();
    }
  }

  /**
   * Carrega o histórico de um dia específico
   */
  carregarHistoricoDia(data: string): void {
    const historico = this.obterHistoricoPorData(data);
    
    if (historico) {
      this.mensagensChat = historico.mensagens.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      
      this.mostrarHistorico = false;
      
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  deletarHistoricoDia(data: string): void {
    const dataFormatada = this.formatarDataHistorico(data);

    this.abrirConfirmacao(
      'Excluir histórico',
      `Deseja realmente excluir o histórico de ${dataFormatada}?`,
      () => {
        try {
          const chave = this.gerarChaveStorage(data);
          localStorage.removeItem(chave);

          // Remove da lista de históricos
          const listaHistoricos = localStorage.getItem('chatHistoricoLista');
          if (listaHistoricos) {
            let datas: string[] = JSON.parse(listaHistoricos);
            datas = datas.filter(d => d !== data);
            localStorage.setItem('chatHistoricoLista', JSON.stringify(datas));
          }

          // Se deletou o histórico de hoje, inicia nova conversa
          if (data === this.obterDataAtual()) {
            this.iniciarNovaConversa();
          }

          this.carregarListaHistoricos();
        } catch (error) {
          console.error('Erro ao deletar histórico:', error);
        }
      }
    );
  }

  limparConversa(): void {
    this.abrirConfirmacao(
      'Limpar conversa',
      'Deseja realmente limpar esta conversa? Esta ação não pode ser desfeita.',
      () => {
        this.iniciarNovaConversa();
        setTimeout(() => this.scrollToBottom(), 100);
      }
    );
  }

  cancelarLimpeza(): void {
    this.mostrarConfirmacao = false;
  }

  confirmarLimpeza(): void {
    this.mostrarConfirmacao = false;
    this.iniciarNovaConversa();
    setTimeout(() => this.scrollToBottom(), 100);
  }

  abrirConfirmacao(titulo: string, mensagem: string, acao: () => void): void {
    this.tituloConfirmacao = titulo;
    this.mensagemConfirmacao = mensagem;
    this.acaoConfirmacao = acao;
    this.mostrarConfirmacao = true;
  }

  cancelarConfirmacao(): void {
    this.mostrarConfirmacao = false;
    this.tituloConfirmacao = '';
    this.mensagemConfirmacao = '';
    this.acaoConfirmacao = null;
  }

  confirmarAcao(): void {
    if (this.acaoConfirmacao) this.acaoConfirmacao();
    this.cancelarConfirmacao();
  }

  // ==================== MÉTODOS EXISTENTES ====================

  carregarDadosUsuario(): void {
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        this.nomeUsuario = profile.nomeCompleto;
        this.objetivo = this.formatarObjetivo(profile.objetivo);
        this.caloriasMeta = profile.metaCalorias;
        this.proteinasMeta = profile.metaProteinas;
        this.carboidratosMeta = profile.metaCarboidratos;
        this.gordurasMeta = profile.metaGorduras;
      },
      error: (err) => {
        console.error('Erro ao buscar perfil do usuário', err);
        this.nomeUsuario = "Erro ao carregar";
      }
    });
  }

  carregarRefeicoesDeHoje(): void {
    this.authService.obterRefeicoesDeHoje().subscribe({
      next: (response) => {
        this.refeicoesDeHoje = response.refeicoes;
        
        this.caloriasConsumidas = response.totais.calorias;
        this.proteinasConsumidas = response.totais.proteinas;
        this.carboidratosConsumidos = response.totais.carboidratos;
        this.gordurasConsumidas = response.totais.gorduras;

        this.atualizarDadosDoGrafico();
      },
      error: (err) => {
        console.error('Erro ao carregar refeições de hoje', err);
      }
    });
  }

  get macroDataForChart(): { name: string, value: number }[] {
    return [
      { name: 'Proteínas', value: this.proteinasConsumidas },
      { name: 'Carboidratos', value: this.carboidratosConsumidos },
      { name: 'Gorduras', value: this.gordurasConsumidas }
    ];
  }

  getBarraCorClasse(): { [key: string]: boolean } {
    const percentual = this.calcularPercentual(this.caloriasConsumidas, this.caloriasMeta);

    return {
      'progress-bar-vermelho': percentual <= 50,
      'progress-bar-amarelo': percentual > 50 && percentual <= 85,
      'progress-bar-verde': percentual > 85
    };
  }

  get hasConsumedData(): boolean {
    return this.proteinasConsumidas > 0 || this.carboidratosConsumidos > 0 || this.gordurasConsumidas > 0;
  }

  atualizarDadosDoGrafico(): void {
    this.dadosDoGrafico = [
      { name: 'Proteínas', value: this.proteinasConsumidas },
      { name: 'Carboidratos', value: this.carboidratosConsumidos },
      { name: 'Gorduras', value: this.gordurasConsumidas }
    ];
  }

  calcularPercentual(consumido: number, meta: number): number {
    if (meta === 0) return 0;
    const percentual = (consumido / meta) * 100;
    return Math.min(percentual, 100);
  }

  enviarMensagemChat(event: Event) { 
    event.preventDefault();
    const inputElement = (event.target as HTMLFormElement).elements.namedItem('chatInput') as HTMLInputElement;
    const mensagem = inputElement.value;
    
    if (mensagem.trim() && !this.aguardandoResposta) {
      this.mensagensChat.push({
        texto: mensagem,
        tipo: 'usuario',
        timestamp: new Date()
      });
      
      this.salvarHistoricoChat();
      inputElement.value = '';
      this.aguardandoResposta = true;
      
      this.authService.criarRefeicao(mensagem, '').subscribe({
        next: (resposta) => {
          if (resposta.sucesso && resposta.refeicao) {
            const mensagemIA = this.formatarRespostaRefeicao(resposta.refeicao);
            
            this.mensagensChat.push({
              texto: mensagemIA,
              tipo: 'ia',
              timestamp: new Date()
            });

            this.carregarRefeicoesDeHoje();
          } else {
            this.mensagensChat.push({
              texto: resposta.mensagem || 'Ocorreu um erro ao processar a refeição.',
              tipo: 'ia',
              timestamp: new Date()
            });
          }

          this.salvarHistoricoChat();
          this.aguardandoResposta = false;
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (erro) => {
          console.error('Erro ao registrar refeição:', erro);
          
          let mensagemErro = 'Desculpe, ocorreu um erro ao processar sua refeição. Por favor, tente novamente.';
          
          if (erro.status === 400 && erro.error?.mensagem) {
            mensagemErro = erro.error.mensagem;
          }
          
          this.mensagensChat.push({
            texto: mensagemErro,
            tipo: 'ia',
            timestamp: new Date()
          });
          
          this.salvarHistoricoChat();
          this.aguardandoResposta = false;
          setTimeout(() => this.scrollToBottom(), 100);
        }
      });
      
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  private formatarRespostaRefeicao(refeicao: RefeicaoDto): string {
    let mensagem = `✅ Refeição "${refeicao.nomeRef}" registrada com sucesso!\n\n`;
    
    mensagem += `📋 Alimentos:\n`;
    refeicao.alimentos.forEach(alimento => {
      mensagem += `• ${alimento.descricao} - ${alimento.quantidade}${alimento.unidade}\n`;
    });
    
    mensagem += `\n📊 Totais desta refeição:\n`;
    mensagem += `• Calorias: ${refeicao.totalCalorias.toFixed(0)} kcal\n`;
    mensagem += `• Proteínas: ${refeicao.totalProteinas.toFixed(1)}g\n`;
    mensagem += `• Carboidratos: ${refeicao.totalCarboidratos.toFixed(1)}g\n`;
    mensagem += `• Gorduras: ${refeicao.totalGorduras.toFixed(1)}g`;
    
    return mensagem;
  }

  private scrollToBottom(): void {
    const chatWindow = document.querySelector('.chat-window');
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  private formatarObjetivo(objetivo: string): string {
    const mapeamento: { [key: string]: string } = {
      'PerderGordura': 'Perder Gordura',
      'TrocarGordura': 'Trocar Gordura',
      'GanharMassa': 'Ganhar Massa'
    };
    
    return mapeamento[objetivo] || 'Objetivo não definido';
  }

  getCorMacro(nomeMacro: string): string {
    const cores: { [key: string]: string } = {
      'Proteínas': '#a8385d',
      'Carboidratos': '#7aa3e5',
      'Gorduras': '#a27ea8'
    };
    return cores[nomeMacro] || '#95a5a6';
  }

  getCorProgressoCalorias(percentual: number): string {
    const p = Math.min(Math.max(percentual, 0), 100);
    
    if (p < 30) {
      return 'linear-gradient(90deg, #dc3545, #ff6b6b)';
    } else if (p < 60) {
      return 'linear-gradient(90deg, #ffc107, #ffdd57)';
    } else if (p < 90) {
      return 'linear-gradient(90deg, #9ccc64, #8bc34a)';
    } else {
      return 'linear-gradient(90deg, #28a745, #20c997)';
    }
  }
}