import { Component, OnInit } from '@angular/core';
import { RegistroDiario } from '../../models/history.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  historico: RegistroDiario[] = [];
  diaExpandido: number | null = 0; // O primeiro dia (hoje) começa expandido

  constructor() { }

  ngOnInit(): void {
    // Gera dados fictícios para os últimos 14 dias
    this.gerarHistoricoFicticio();
  }

  toggleDia(index: number): void {
    // Se o dia clicado já está aberto, fecha. Senão, abre.
    this.diaExpandido = this.diaExpandido === index ? null : index;
  }

  private gerarHistoricoFicticio(): void {
    const historicoTemp = [];
    for (let i = 0; i < 14; i++) {
      const data = new Date();
      data.setDate(data.getDate() - i);

      // Simula 2 a 4 refeições por dia
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