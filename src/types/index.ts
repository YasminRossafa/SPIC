// Representa o usuário autenticado no app
export interface User {
  uid: string;
  nome: string;
  email: string;
}

// Representa uma categoria de comunicação (ex: "Alimentos", "Emoções")
export interface Categoria {
  id: string;
  nome: string;
  criadoEm: Date;
  ordem: number;
}

// Representa uma imagem dentro de uma categoria
export interface Imagem {
  id: string;
  titulo: string;
  storageUrl: string;
  criadoEm: Date;
  ordem: number;
}
