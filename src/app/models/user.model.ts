export interface UserProfileDto {
  nomeCompleto: string;
  email?: string;
  dataNascimento?: string;
  alturaEmCm?: number;
  pesoEmKg?: number;
  genero?: number;
  nivelDeAtividade?: number;
  objetivo: string;
  metaCalorias: number;
  metaProteinas: number;
  metaCarboidratos: number;
  metaGorduras: number;
}