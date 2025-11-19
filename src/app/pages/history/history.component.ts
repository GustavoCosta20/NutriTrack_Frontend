import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistroDiario } from '../../models/history.model';
import { AuthService } from '../../services/auth.service';
import { RefeicaoDto } from 'src/app/models/snack.model';

interface RefeicaoComId {
  id: string;
  nome: string;
  alimentos: Array<{
    descricao: string;
    calorias: number;
  }>;
  totalCalorias: number;
}

interface RegistroDiarioComId extends RegistroDiario {
  refeicoes: RefeicaoComId[];
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  historico: RegistroDiarioComId[] = [];
  diaExpandido: number | null = 0;
  carregando: boolean = false;
  erro: string = '';

  modalExcluirAberto: boolean = false;
  refeicaoParaExcluir: { id: string; nome: string } | null = null;
  excluindo: boolean = false;

  modalEditarAberto: boolean = false;
  refeicaoParaEditar: { id: string; nome: string } | null = null;
  nomeEdicao: string = '';
  editando: boolean = false;
  erroEdicao: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.carregarHistorico();
  }

  toggleDia(index: number): void {
    this.diaExpandido = this.diaExpandido === index ? null : index;
  }

  abrirModalExcluir(refeicaoId: string, nomeRefeicao: string): void {
    this.refeicaoParaExcluir = { id: refeicaoId, nome: nomeRefeicao };
    this.modalExcluirAberto = true;
  }

  fecharModalExcluir(): void {
    if (!this.excluindo) {
      this.modalExcluirAberto = false;
      this.refeicaoParaExcluir = null;
    }
  }

  confirmarExclusao(): void {
    if (!this.refeicaoParaExcluir || this.excluindo) return;

    this.excluindo = true;

    this.authService.excluirRefeicao(this.refeicaoParaExcluir.id).subscribe({
      next: () => {
        console.log('✅ Refeição excluída com sucesso!');
        this.excluindo = false;
        this.fecharModalExcluir();
        this.carregarHistorico();
      },
      error: (error) => {
        console.error('❌ Erro ao excluir refeição:', error);
        this.excluindo = false;
        alert('Erro ao excluir refeição. Tente novamente.');
      }
    });
  }

  abrirModalEditar(refeicaoId: string, nomeRefeicao: string): void {
    this.refeicaoParaEditar = { id: refeicaoId, nome: nomeRefeicao };
    this.nomeEdicao = nomeRefeicao;
    this.erroEdicao = '';
    this.modalEditarAberto = true;
  }

  fecharModalEditar(): void {
    if (!this.editando) {
      this.modalEditarAberto = false;
      this.refeicaoParaEditar = null;
      this.nomeEdicao = '';
      this.erroEdicao = '';
    }
  }

  confirmarEdicao(): void {
    if (!this.refeicaoParaEditar || this.editando) return;

    if (!this.nomeEdicao.trim()) {
      this.erroEdicao = 'Por favor, informe o nome da refeição.';
      return;
    }

    this.editando = true;
    this.erroEdicao = '';

    this.authService.atualizarNomeRefeicao(
      this.refeicaoParaEditar.id,
      this.nomeEdicao
    ).subscribe({
      next: (response) => {
        console.log('✅ Nome da refeição atualizado com sucesso!', response);
        this.atualizarRefeicaoLocal(this.refeicaoParaEditar!.id, this.nomeEdicao);
        
        this.editando = false;
        this.fecharModalEditar();
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar refeição:', error);
        this.editando = false;
        
        if (error.error?.mensagem) {
          this.erroEdicao = error.error.mensagem;
        } else {
          this.erroEdicao = 'Erro ao atualizar refeição. Tente novamente.';
        }
      }
    });
  }

  private atualizarRefeicaoLocal(refeicaoId: string, novoNome: string): void {
    for (const dia of this.historico) {
      const refeicao = dia.refeicoes.find(r => r.id === refeicaoId);
      if (refeicao) {
        refeicao.nome = novoNome;
        break;
      }
    }
  }

  private carregarHistorico(): void {
    this.carregando = true;
    this.erro = '';

    this.authService.obterRefeicoes().subscribe({
      next: (refeicoes: RefeicaoDto[]) => {
        this.processarRefeicoes(refeicoes);
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar histórico:', error);
        this.erro = 'Não foi possível carregar o histórico de refeições.';
        this.carregando = false;
      }
    });
  }

  private processarRefeicoes(refeicoes: RefeicaoDto[]): void {
    const refeicoesAgrupadas = new Map<string, RefeicaoDto[]>();

    refeicoes.forEach(refeicao => {
      const dataString = refeicao.data;
      
      if (!refeicoesAgrupadas.has(dataString)) {
        refeicoesAgrupadas.set(dataString, []);
      }
      refeicoesAgrupadas.get(dataString)!.push(refeicao);
    });

    const historicoTemp: RegistroDiarioComId[] = [];

    const datasOrdenadas = Array.from(refeicoesAgrupadas.keys()).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    const hoje = new Date();
    const dataHojeString = this.formatarDataParaComparacao(hoje);

    datasOrdenadas.forEach(dataString => {
      const refeicoesNoDia = refeicoesAgrupadas.get(dataString)!;
      let totalCaloriasDia = 0;

      const refeicoesMapeadas = refeicoesNoDia.map(ref => {
        totalCaloriasDia += ref.totalCalorias;

        return {
          id: ref.id,
          nome: ref.nomeRef,
          alimentos: ref.alimentos.map(alim => ({
            descricao: `${alim.descricao} (${alim.quantidade}${alim.unidade})`,
            calorias: alim.calorias
          })),
          totalCalorias: ref.totalCalorias
        };
      });

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

  private criarDataLocal(dataString: string): Date {
    if (dataString.includes('T')) {
      dataString = dataString.split('T')[0];
    }
    
    const [ano, mes, dia] = dataString.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  private formatarDataParaComparacao(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}