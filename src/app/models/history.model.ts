export interface AlimentoConsumido {
  descricao: string;
  calorias: number;
}

export interface Refeicao {
  nome: string;
  alimentos: AlimentoConsumido[];
  totalCalorias: number;
}

export interface RegistroDiario {
  data: Date;
  refeicoes: Refeicao[];
  totalCaloriasDia: number;
  isHoje?: boolean;
}