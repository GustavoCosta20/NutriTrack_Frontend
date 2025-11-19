import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RefeicaoDto } from 'src/app/models/snack.model';

interface MensagemChat {
  texto: string;
  tipo: 'usuario' | 'ia';
  timestamp: Date;
  refeicaoId?: string;
  podEditar?: boolean;
}

interface HistoricoChat {
  data: string;
  mensagens: MensagemChat[];
}

interface MensagemChatIA {
  texto: string;
  tipo: 'usuario' | 'ia';
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;
  nomeUsuario: string = "Carregando...";
  objetivo: string = "-";
  caloriasMeta: number = 0;
  proteinasMeta: number = 0;
  carboidratosMeta: number = 0;
  gordurasMeta: number = 0;

  caloriasConsumidas: number = 0;
  proteinasConsumidas: number = 0;
  carboidratosConsumidos: number = 0;
  gordurasConsumidas: number = 0;

  refeicoesDeHoje: RefeicaoDto[] = [];

  dadosDoGrafico: { name: string, value: number }[] = [];
  colorScheme = {
    domain: ['#e63e28ff', '#92918dff', '#C7B42C'] 
  };

  mensagensChat: MensagemChat[] = [];
  aguardandoResposta = false;
  
  mostrarHistorico = false;
  historicoConversas: HistoricoChat[] = [];
  mostrarConfirmacao = false;
  tituloConfirmacao = '';
  mensagemConfirmacao = '';
  acaoConfirmacao: (() => void) | null = null;

  mensagemEditando: MensagemChat | null = null;
  refeicaoEditando: string = '';

  mostrarChatIA = false;
  mensagensChatIA: MensagemChatIA[] = [];
  aguardandoRespostaIA = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.carregarDadosUsuario();
    this.carregarRefeicoesDeHoje();
    this.carregarHistoricoChat();
    this.carregarListaHistoricos();
    this.carregarHistoricoChatIA();
  }

  private carregarHistoricoChat(): void {
    const hoje = this.obterDataAtual();
    const historicoHoje = this.obterHistoricoPorData(hoje);
    
    if (historicoHoje && historicoHoje.mensagens.length > 0) {
      this.mensagensChat = historicoHoje.mensagens.map((msg: any) => ({
        texto: msg.texto,
        tipo: msg.tipo,
        timestamp: new Date(msg.timestamp),
        refeicaoId: msg.refeicaoId,
        podEditar: msg.podEditar
      }));
    } else {
      this.iniciarNovaConversa();
    }
  }

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

  private carregarListaHistoricos(): void {
    try {
      const listaHistoricos = localStorage.getItem('chatHistoricoLista');
      if (listaHistoricos) {
        const datas: string[] = JSON.parse(listaHistoricos);
        
        this.historicoConversas = datas
          .map(data => this.obterHistoricoPorData(data))
          .filter(hist => hist !== null) as HistoricoChat[];
        
        this.historicoConversas.sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
      }
    } catch (error) {
      console.error('Erro ao carregar lista de históricos:', error);
    }
  }

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

  private gerarChaveStorage(data: string): string {
    return `chatHistorico_${data}`;
  }

  private obterDataAtual(): string {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }

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

  toggleHistoricoChat(): void {
    this.mostrarHistorico = !this.mostrarHistorico;
    if (this.mostrarHistorico) {
      this.carregarListaHistoricos();
    }
  }

  carregarHistoricoDia(data: string): void {
    const historico = this.obterHistoricoPorData(data);
    
    if (historico) {
      this.mensagensChat = historico.mensagens.map((msg: any) => ({
        texto: msg.texto,
        tipo: msg.tipo,
        timestamp: new Date(msg.timestamp),
        refeicaoId: msg.refeicaoId,
        podEditar: msg.podEditar
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

          const listaHistoricos = localStorage.getItem('chatHistoricoLista');
          if (listaHistoricos) {
            let datas: string[] = JSON.parse(listaHistoricos);
            datas = datas.filter(d => d !== data);
            localStorage.setItem('chatHistoricoLista', JSON.stringify(datas));
          }

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

  iniciarEdicaoRefeicao(mensagem: MensagemChat): void {
    if (!mensagem.refeicaoId) return;
    
    this.mensagemEditando = mensagem;
    this.refeicaoEditando = mensagem.refeicaoId;
    
    setTimeout(() => {
      const inputElement = document.querySelector('input[name="chatInput"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.placeholder = '✏️ Editando refeição... Digite a nova descrição';
        inputElement.focus();
      }
    }, 100);
  }

  cancelarEdicao(): void {
    this.mensagemEditando = null;
    this.refeicaoEditando = '';
    
    const inputElement = document.querySelector('input[name="chatInput"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.placeholder = 'Digite sua refeição aqui...';
      inputElement.value = '';
    }
  }

  private editarRefeicao(novaDescricao: string): void {
    if (!this.mensagemEditando || !this.refeicaoEditando) return;
    
    this.aguardandoResposta = true;

    this.mensagensChat.push({
      texto: `✏️ Editando: ${novaDescricao}`,
      tipo: 'usuario',
      timestamp: new Date()
    });
    
    this.authService.atualizarRefeicao(this.refeicaoEditando, novaDescricao, '').subscribe({
      next: (resposta) => {
        if (resposta.sucesso && resposta.refeicao) {
          const mensagemIA = `✅ Refeição atualizada com sucesso!\n\n${this.formatarRespostaRefeicao(resposta.refeicao)}`;
          
          this.mensagensChat.push({
            texto: mensagemIA,
            tipo: 'ia',
            timestamp: new Date(),
            refeicaoId: resposta.refeicao.id,
            podEditar: true
          });

          this.carregarRefeicoesDeHoje();
        } else {
          this.mensagensChat.push({
            texto: resposta.mensagem || 'Ocorreu um erro ao atualizar a refeição.',
            tipo: 'ia',
            timestamp: new Date()
          });
        }

        this.cancelarEdicao();
        this.salvarHistoricoChat();
        this.aguardandoResposta = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (erro) => {
        console.error('Erro ao editar refeição:', erro);
        
        let mensagemErro = 'Desculpe, ocorreu um erro ao atualizar sua refeição. Por favor, tente novamente.';
        
        if (erro.status === 400 && erro.error?.mensagem) {
          mensagemErro = erro.error.mensagem;
        }
        
        this.mensagensChat.push({
          texto: mensagemErro,
          tipo: 'ia',
          timestamp: new Date()
        });
        
        this.cancelarEdicao();
        this.salvarHistoricoChat();
        this.aguardandoResposta = false;
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
    
    const inputElement = document.querySelector('input[name="chatInput"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
    
    setTimeout(() => this.scrollToBottom(), 100);
  }

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
      if (this.mensagemEditando && this.mensagemEditando.refeicaoId) {
        this.editarRefeicao(mensagem);
        return;
      }

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
              timestamp: new Date(),
              refeicaoId: resposta.refeicao.id,
              podEditar: true
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

  excluirRefeicao(mensagem: MensagemChat): void {
    if (!mensagem.refeicaoId) return;

    this.abrirConfirmacao(
      'Excluir refeição',
      'Deseja realmente excluir esta refeição? Esta ação não pode ser desfeita.',
      () => {
        this.aguardandoResposta = true;

        this.authService.excluirRefeicao(mensagem.refeicaoId!).subscribe({
          next: (resposta) => {
            this.mensagensChat = this.mensagensChat.filter(m => {
              if (m.tipo === 'ia' && m.refeicaoId === mensagem.refeicaoId) {
                console.log('Removendo mensagem da IA com refeicaoId:', m.refeicaoId);
                return false;
              }
              return true;
            });

            this.mensagensChat.push({
              texto: '🗑️ Refeição excluída com sucesso!',
              tipo: 'ia',
              timestamp: new Date()
            });

            const hoje = this.obterDataAtual();
            const chaveStorage = this.gerarChaveStorage(hoje);
            
            const dadosParaSalvar: HistoricoChat = {
              data: hoje,
              mensagens: this.mensagensChat
            };
            
            try {
              localStorage.setItem(chaveStorage, JSON.stringify(dadosParaSalvar));
            } catch (error) {
              console.error('❌ Erro ao salvar no localStorage:', error);
            }

            this.carregarRefeicoesDeHoje();
            
            this.aguardandoResposta = false;
            setTimeout(() => this.scrollToBottom(), 100);
          },
          error: (erro) => {
            console.error('Erro ao excluir refeição:', erro);
            
            let mensagemErro = 'Desculpe, ocorreu um erro ao excluir sua refeição. Por favor, tente novamente.';
            
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
      }
    );
  }

  toggleChatIA(): void {
    this.mostrarChatIA = !this.mostrarChatIA;
    
    if (this.mostrarChatIA && this.mensagensChatIA.length === 0) {
      this.iniciarChatIA();
    }
    
    if (this.mostrarChatIA) {
      setTimeout(() => this.scrollToBottomIA(), 100);
    }
  }

  private iniciarChatIA(): void {
    this.mensagensChatIA = [
      {
        texto: '👋 Olá! Sou sua assistente nutricional. Posso ajudá-lo com:\n\n' +
              '• Sugestões de dietas e cardápios\n' +
              '• Melhores horários para refeições\n' +
              '• Dúvidas sobre alimentos e nutrientes\n' +
              '• Dicas de alimentação saudável\n\n' +
              'Como posso ajudá-lo hoje?',
        tipo: 'ia',
        timestamp: new Date()
      }
    ];
    this.salvarHistoricoChatIA();
  }

  enviarMensagemIA(event: Event): void {
    event.preventDefault();
    const inputElement = (event.target as HTMLFormElement).elements.namedItem('chatIAInput') as HTMLInputElement;
    const mensagem = inputElement.value;

    if (mensagem.trim() && !this.aguardandoRespostaIA) {
      this.mensagensChatIA.push({
        texto: mensagem,
        tipo: 'usuario',
        timestamp: new Date()
      });

      this.salvarHistoricoChatIA();
      inputElement.value = '';
      this.aguardandoRespostaIA = true;

      this.authService.conversarComIA(mensagem).subscribe({
        next: (resposta) => {
          if (resposta.sucesso && resposta.resposta) {
            this.mensagensChatIA.push({
              texto: resposta.resposta,
              tipo: 'ia',
              timestamp: new Date()
            });
          } else {
            this.mensagensChatIA.push({
              texto: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
              tipo: 'ia',
              timestamp: new Date()
            });
          }

          this.salvarHistoricoChatIA();
          this.aguardandoRespostaIA = false;
          setTimeout(() => this.scrollToBottomIA(), 100);
        },
        error: (erro) => {
          console.error('Erro ao conversar com IA:', erro);

          this.mensagensChatIA.push({
            texto: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
            tipo: 'ia',
            timestamp: new Date()
          });

          this.salvarHistoricoChatIA();
          this.aguardandoRespostaIA = false;
          setTimeout(() => this.scrollToBottomIA(), 100);
        }
      });

      setTimeout(() => this.scrollToBottomIA(), 100);
    }
  }

  limparChatIA(): void {
    this.abrirConfirmacao(
      'Limpar chat com IA',
      'Deseja realmente limpar esta conversa?',
      () => {
        this.iniciarChatIA();
        setTimeout(() => this.scrollToBottomIA(), 100);
      }
    );
  }

  private scrollToBottomIA(): void {
    const chatWindow = document.querySelector('.chat-ia-window');
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  private salvarHistoricoChatIA(): void {
    try {
      localStorage.setItem('chatIAHistorico', JSON.stringify(this.mensagensChatIA));
    } catch (error) {
      console.error('Erro ao salvar histórico do chat IA:', error);
    }
  }

  private carregarHistoricoChatIA(): void {
    try {
      const historico = localStorage.getItem('chatIAHistorico');
      if (historico) {
        this.mensagensChatIA = JSON.parse(historico).map((msg: any) => ({
          texto: msg.texto,
          tipo: msg.tipo,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do chat IA:', error);
    }
  }
}