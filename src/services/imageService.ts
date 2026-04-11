import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, auth, storage } from "../config/firebase";
import { Imagem } from "../types";

// Retorna a referência da subcoleção de imagens de uma categoria
function imagensRef(categoriaId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");
  return collection(
    db,
    "usuarios",
    uid,
    "categorias",
    categoriaId,
    "imagens"
  );
}

// Faz upload da imagem para o Storage e salva os metadados no Firestore
export async function criarImagem(
  categoriaId: string,
  titulo: string,
  imageUri: string,
  ordem: number
) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");

  // Converte a URI local em blob para upload
  const response = await fetch(imageUri);
  const blob = await response.blob();

  // Define o caminho no Storage
  const storageRef = ref(
    storage,
    `usuarios/${uid}/categorias/${categoriaId}/${Date.now()}.jpg`
  );
  await uploadBytes(storageRef, blob);
  const storageUrl = await getDownloadURL(storageRef);

  // Salva os metadados no Firestore
  return addDoc(imagensRef(categoriaId), {
    titulo,
    storageUrl,
    ordem,
    criadoEm: serverTimestamp(),
  });
}

// Lista todas as imagens de uma categoria, ordenadas
export async function listarImagens(categoriaId: string): Promise<Imagem[]> {
  const q = query(imagensRef(categoriaId), orderBy("ordem", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    criadoEm: d.data().criadoEm?.toDate() ?? new Date(),
  })) as Imagem[];
}

// Escuta imagens de uma categoria em tempo real, retorna função de unsubscribe
export function ouvirImagens(
  categoriaId: string,
  callback: (imagens: Imagem[]) => void
) {
  const q = query(imagensRef(categoriaId), orderBy("ordem", "asc"));
  return onSnapshot(q, (snapshot) => {
    const imagens = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      criadoEm: d.data().criadoEm?.toDate() ?? new Date(),
    })) as Imagem[];
    callback(imagens);
  });
}

// Atualiza metadados de uma imagem
export async function atualizarImagem(
  categoriaId: string,
  imagemId: string,
  dados: Partial<Pick<Imagem, "titulo" | "ordem">>
) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");
  const docRef = doc(
    db,
    "usuarios",
    uid,
    "categorias",
    categoriaId,
    "imagens",
    imagemId
  );
  return updateDoc(docRef, dados);
}

// Exclui uma imagem do Firestore e do Storage
export async function excluirImagem(
  categoriaId: string,
  imagemId: string,
  storageUrl: string
) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");

  // Remove do Firestore
  const docRef = doc(
    db,
    "usuarios",
    uid,
    "categorias",
    categoriaId,
    "imagens",
    imagemId
  );
  await deleteDoc(docRef);

  // Remove do Storage
  const storageRef = ref(storage, storageUrl);
  await deleteObject(storageRef);
}
