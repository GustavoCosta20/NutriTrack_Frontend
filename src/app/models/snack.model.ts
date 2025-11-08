export interface AlimentoConsumidoDto {
  id: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
}

export interface RefeicaoDto {
  id: string;
  nomeRef: string;
  data: string;
  alimentos: AlimentoConsumidoDto[];
  totalCalorias: number;
  totalProteinas: number;
  totalCarboidratos: number;
  totalGorduras: number;
}

export interface CriarRefeicaoRequest {
  descricaoRefeicao: string;
  nomeRefeicao: string;
}

export interface CriarRefeicaoResponse {
  sucesso: boolean;
  mensagem: string;
  refeicao: RefeicaoDto;
}

export interface RefeicoesDoHojeResponse {
  refeicoes: RefeicaoDto[];
  totais: {
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  };
}