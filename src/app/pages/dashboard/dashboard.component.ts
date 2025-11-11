import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RefeicaoDto } from 'src/app/models/snack.model';

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

  //Propriedades do Chat
  mensagensChat: Array<{ texto: string, tipo: 'usuario' | 'ia', timestamp: Date }> = [
    { 
      texto: 'Olá! Sou sua assistente NutriTrack. Descreva o que você comeu para eu registrar sua refeição. Ex: "2 ovos mexidos, 1 pão francês e 1 copo de café com leite"', 
      tipo: 'ia',
      timestamp: new Date()
    }
  ];

  aguardandoResposta = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.carregarDadosUsuario();
    this.carregarRefeicoesDeHoje();
    this.carregarHistoricoChat();
  }

  private carregarHistoricoChat(): void {
    const hoje = new Date().toDateString();
    const historicoSalvo = localStorage.getItem('chatHistorico');
    
    if (historicoSalvo) {
      try {
        const dados = JSON.parse(historicoSalvo);
        
        // Verificar se o histórico é do dia atual
        if (dados.data === hoje) {
          // Converter as strings de timestamp de volta para objetos Date
          this.mensagensChat = dados.mensagens.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        } else {
          // Se for de outro dia, limpar e iniciar nova conversa
          this.iniciarNovaConversa();
        }
      } catch (error) {
        console.error('Erro ao carregar histórico do chat:', error);
        this.iniciarNovaConversa();
      }
    } else {
      this.iniciarNovaConversa();
    }
  }

  private iniciarNovaConversa(): void {
    this.mensagensChat = [
      { 
        texto: 'Olá! Sou sua assistente NutriTrack. O que você comeu hoje?', 
        tipo: 'ia',
        timestamp: new Date()
      }
    ];
    this.salvarHistoricoChat();
  }

  private salvarHistoricoChat(): void {
    const hoje = new Date().toDateString();
    const dadosParaSalvar = {
      data: hoje,
      mensagens: this.mensagensChat
    };
    
    try {
      localStorage.setItem('chatHistorico', JSON.stringify(dadosParaSalvar));
    } catch (error) {
      console.error('Erro ao salvar histórico do chat:', error);
    }
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
        
        // Atualiza os totais consumidos
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

  /**
   * NOVO: Enviar mensagem e criar refeição
   */
  enviarMensagemChat(event: Event) { 
    event.preventDefault();
    const inputElement = (event.target as HTMLFormElement).elements.namedItem('chatInput') as HTMLInputElement;
    const mensagem = inputElement.value;
    
    if (mensagem.trim() && !this.aguardandoResposta) {
      // Adicionar mensagem do usuário ao chat
      this.mensagensChat.push({
        texto: mensagem,
        tipo: 'usuario',
        timestamp: new Date()
      });
      
      this.salvarHistoricoChat();
      inputElement.value = '';
      this.aguardandoResposta = true;
      
      // Chamar o serviço para criar a refeição (processa com IA e salva)
      this.authService.criarRefeicao(mensagem, '').subscribe({
        next: (resposta) => {
          if (resposta.sucesso && resposta.refeicao) {
            // Montar mensagem de resposta formatada
            const mensagemIA = this.formatarRespostaRefeicao(resposta.refeicao);
            
            this.mensagensChat.push({
              texto: mensagemIA,
              tipo: 'ia',
              timestamp: new Date()
            });

            // Atualizar a lista de refeições e totais
            this.carregarRefeicoesDeHoje();
          } else {
            // MUDANÇA: Agora trata mensagens de erro de validação
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
          
          // MUDANÇA: Verifica se é erro de validação (400 Bad Request)
          let mensagemErro = 'Desculpe, ocorreu um erro ao processar sua refeição. Por favor, tente novamente.';
          
          if (erro.status === 400 && erro.error?.mensagem) {
            // Erro de validação - mostra a mensagem específica
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

  /**
   * Formata a resposta da refeição para exibir no chat
   */
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