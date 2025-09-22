import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // --- DADOS DE METAS (Vindos da API no futuro) ---
  nomeUsuario: string = "Gustavo";
  objetivo: string = "Ganhar Massa Muscular";
  caloriasMeta: number = 2650;
  proteinasMeta: number = 180;
  carboidratosMeta: number = 320;
  gordurasMeta: number = 70;

  // --- DADOS PROGRESSO DIÁRIO ---
  caloriasConsumidas: number = 0;
  proteinasConsumidas: number = 0;
  carboidratosConsumidos: number = 0;
  gordurasConsumidas: number = 0;

  dadosDoGrafico: { name: string, value: number }[] = [];

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


  // Cores gráfico
  colorScheme = {
    domain: ['#e63e28ff', '#92918dff', '#C7B42C'] 
  };

  get hasConsumedData(): boolean {
    // Retorna verdadeiro se qualquer um dos macros consumidos for maior que zero
    return this.proteinasConsumidas > 0 || this.carboidratosConsumidos > 0 || this.gordurasConsumidas > 0;
  }

  constructor() { }

  ngOnInit(): void {
    // No futuro, aqui chamar serviço para busca dos dados do usuário da API.
    this.atualizarDadosDoGrafico(); 
  }

  atualizarDadosDoGrafico(): void {
    this.dadosDoGrafico = [
      { name: 'Proteínas', value: this.proteinasConsumidas },
      { name: 'Carboidratos', value: this.carboidratosConsumidos },
      { name: 'Gorduras', value: this.gordurasConsumidas }
    ];
  }

  /**
   Calcula o percentual do valor consumido em relação à meta.
   Limita o resultado a 100% para a barra de progresso não ultrapassar o limite.
   */
  calcularPercentual(consumido: number, meta: number): number {
    if (meta === 0) return 0;
    const percentual = (consumido / meta) * 100;
    return Math.min(percentual, 100); // Retorna o menor valor entre o percentual e 100
  }

  /**
   * Método de simulação para adicionar uma refeição e ver o progresso mudar.
   */
  simularAdicaoRefeicao(): void {
    // Exemplo de uma refeição
    const refeicao = {
      calorias: 450,
      proteinas: 30,
      carboidratos: 55,
      gorduras: 12
    };

    // Adiciona os valores da refeição aos totais consumidos
    this.caloriasConsumidas += refeicao.calorias;
    this.proteinasConsumidas += refeicao.proteinas;
    this.carboidratosConsumidos += refeicao.carboidratos;
    this.gordurasConsumidas += refeicao.gorduras;

    this.atualizarDadosDoGrafico();

    console.log('Refeição adicionada!', { consumido: this.caloriasConsumidas, meta: this.caloriasMeta });
  }

  // ... (método enviarMensagemChat continua aqui)
  enviarMensagemChat(event: Event) { /* ... */ }
}