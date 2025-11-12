import { Component, OnInit } from '@angular/core';
import { RegistroDiario } from '../../models/history.model';
import { AuthService } from '../../services/auth.service';
import { RefeicaoDto } from 'src/app/models/snack.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  historico: RegistroDiario[] = [];
  diaExpandido: number | null = 0; // O primeiro dia (hoje) começa expandido
  carregando: boolean = false;
  erro: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.carregarHistorico();
  }

  toggleDia(index: number): void {
    // Se o dia clicado já está aberto, fecha. Senão, abre.
    this.diaExpandido = this.diaExpandido === index ? null : index;
  }

  private carregarHistorico(): void {
    this.carregando = true;
    this.erro = '';

    // Buscar todas as refeições do backend
    this.authService.obterRefeicoes().subscribe({
      next: (refeicoes: RefeicaoDto[]) => {
        this.processarRefeicoes(refeicoes);
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar histórico:', error);
        this.erro = 'Não foi possível carregar o histórico de refeições.';
        this.carregando = false;
        // Fallback para dados fictícios em caso de erro (opcional)
        // this.gerarHistoricoFicticio();
      }
    });
  }

  private processarRefeicoes(refeicoes: RefeicaoDto[]): void {
    // Agrupar refeições por data
    const refeicoesAgrupadas = new Map<string, RefeicaoDto[]>();

    refeicoes.forEach(refeicao => {
      const dataString = refeicao.data; // formato ISO da API
      
      if (!refeicoesAgrupadas.has(dataString)) {
        refeicoesAgrupadas.set(dataString, []);
      }
      refeicoesAgrupadas.get(dataString)!.push(refeicao);
    });

    // Converter para o formato esperado pelo template
    const historicoTemp: RegistroDiario[] = [];

    // Ordenar as datas (mais recente primeiro)
    const datasOrdenadas = Array.from(refeicoesAgrupadas.keys()).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    // Obter a data de hoje em formato DateOnly (sem hora)
    const hoje = new Date();
    const dataHojeString = this.formatarDataParaComparacao(hoje);

    datasOrdenadas.forEach(dataString => {
      const refeicoesNoDia = refeicoesAgrupadas.get(dataString)!;
      let totalCaloriasDia = 0;

      const refeicoesMapeadas = refeicoesNoDia.map(ref => {
        totalCaloriasDia += ref.totalCalorias;

        return {
          nome: ref.nomeRef,
          alimentos: ref.alimentos.map(alim => ({
            descricao: `${alim.descricao} (${alim.quantidade}${alim.unidade})`,
            calorias: alim.calorias
          })),
          totalCalorias: ref.totalCalorias
        };
      });

      // CORREÇÃO: Criar a data corretamente para evitar problemas de timezone
      const dataRefeicao = this.criarDataLocal(dataString);
      const isHoje = this.formatarDataParaComparacao(dataRefeicao) === dataHojeString;

      historicoTemp.push({
        data: dataRefeicao,
        refeicoes: refeicoesMapeadas,
        totalCaloriasDia: totalCaloriasDia,
        isHoje: isHoje
      });
    });

    this.historico = historicoTemp;
  }

  // NOVO MÉTODO: Criar data local a partir de string YYYY-MM-DD
  private criarDataLocal(dataString: string): Date {
    // Se a string vier no formato ISO completo (2025-11-08T00:00:00)
    if (dataString.includes('T')) {
      dataString = dataString.split('T')[0];
    }
    
    // Dividir a string em ano, mês e dia
    const [ano, mes, dia] = dataString.split('-').map(Number);
    
    // Criar data local (sem conversão de timezone)
    return new Date(ano, mes - 1, dia);
  }

  // Método auxiliar para comparar apenas ano, mês e dia
  private formatarDataParaComparacao(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  // Método fictício mantido para referência/teste (pode remover depois)
  private gerarHistoricoFicticio(): void {
    const historicoTemp = [];
    for (let i = 0; i < 14; i++) {
      const data = new Date();
      data.setDate(data.getDate() - i);

      const numRefeicoes = Math.floor(Math.random() * 3) + 2;
      const refeicoes = [];
      let totalCaloriasDia = 0;

      for (let j = 0; j < numRefeicoes; j++) {
        const alimentos = [
          { descricao: 'Alimento ' + (Math.floor(Math.random() * 5) + 1), calorias: Math.floor(Math.random() * 300) + 100 },
          { descricao: 'Alimento ' + (Math.floor(Math.random() * 5) + 6), calorias: Math.floor(Math.random() * 200) + 50 }
        ];
        const totalCaloriasRefeicao = alimentos.reduce((soma, al) => soma + al.calorias, 0);
        totalCaloriasDia += totalCaloriasRefeicao;

        refeicoes.push({
          nome: 'Refeição ' + (j + 1),
          alimentos: alimentos,
          totalCalorias: totalCaloriasRefeicao
        });
      }

      historicoTemp.push({
        data: data,
        refeicoes: refeicoes,
        totalCaloriasDia: totalCaloriasDia
      });
    }
    this.historico = historicoTemp;
  }
}