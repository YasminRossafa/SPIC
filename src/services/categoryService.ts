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
import { ref, listAll, deleteObject } from "firebase/storage";
import { db, auth, storage } from "../config/firebase";
import { Categoria } from "../types";

// Retorna a referência da subcoleção de categorias do usuário logado
function categoriasRef() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");
  return collection(db, "usuarios", uid, "categorias");
}

// Cria uma nova categoria
export async function criarCategoria(nome: string, ordem: number) {
  return addDoc(categoriasRef(), {
    nome,
    ordem,
    criadoEm: serverTimestamp(),
  });
}

// Busca todas as categorias do usuário, ordenadas
export async function listarCategorias(): Promise<Categoria[]> {
  const q = query(categoriasRef(), orderBy("ordem", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    criadoEm: doc.data().criadoEm?.toDate() ?? new Date(),
  })) as Categoria[];
}

// Atualiza uma categoria existente
export async function atualizarCategoria(
  id: string,
  dados: Partial<Pick<Categoria, "nome" | "ordem">>
) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");
  const ref = doc(db, "usuarios", uid, "categorias", id);
  return updateDoc(ref, dados);
}

// Escuta categorias em tempo real via onSnapshot, retorna função de unsubscribe
export function ouvirCategorias(
  callback: (categorias: Categoria[]) => void
) {
  const q = query(categoriasRef(), orderBy("ordem", "asc"));
  return onSnapshot(q, (snapshot) => {
    const categorias = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      criadoEm: d.data().criadoEm?.toDate() ?? new Date(),
    })) as Categoria[];
    callback(categorias);
  });
}

// Exclui uma categoria e todas as suas imagens (Firestore + Storage)
export async function excluirCategoria(id: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");

  // Remove todas as imagens da subcoleção no Firestore
  const imagensSnap = await getDocs(
    collection(db, "usuarios", uid, "categorias", id, "imagens")
  );
  const deletePromises = imagensSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletePromises);

  // Remove todos os arquivos da pasta no Storage
  try {
    const folderRef = ref(storage, `usuarios/${uid}/categorias/${id}`);
    const fileList = await listAll(folderRef);
    await Promise.all(fileList.items.map((item) => deleteObject(item)));
  } catch {
    // Pasta pode não existir se nenhuma imagem foi enviada
  }

  // Remove o documento da categoria
  const catRef = doc(db, "usuarios", uid, "categorias", id);
  return deleteDoc(catRef);
}
