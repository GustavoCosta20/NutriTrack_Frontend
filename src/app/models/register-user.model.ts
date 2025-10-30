
export enum Genero {
  Masculino = 1,
  Feminino = 2,
  Outro = 3,
}

export enum NivelDeAtividade {
  Sedentario = 1,
  AtividadeLeve = 2,
  AtividadeModerada = 3,
  AtividadeAlta = 4,
}

export enum Objetivo {
  PerderGordura = 1,
  TrocarGordura = 2,
  GanharMassa = 3,
}

// A interface principal que define a estrutura dos dados de registro
export interface RegisterUser {
  nomeCompleto: string;
  email: string;
  senha: string;
  dataNascimento: string;
  alturaEmCm: number;
  pesoEmKg: number;
  genero: Genero;
  nivelDeAtividade: NivelDeAtividade;
  objetivo: Objetivo;
}