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
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { db, auth, storage } from "../config/firebase";
import { Imagem } from "../types";

const STORAGE_BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!;

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

// Faz upload de um arquivo de imagem para o Storage e retorna a URL pública
async function uploadParaStorage(
  categoriaId: string,
  imageUri: string
): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");

  const storagePath = `usuarios/${uid}/categorias/${categoriaId}/${Date.now()}.jpg`;

  if (Platform.OS === "web") {
    const storageRef = ref(storage, storagePath);
    const resp = await fetch(imageUri);
    const blob = await resp.blob();
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  }

  // Mobile: envia binário direto pela REST API do Firebase Storage
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error("Usuário não autenticado");

  const uploadUrl =
    `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o` +
    `?uploadType=media&name=${encodeURIComponent(storagePath)}`;

  const result = await FileSystem.uploadAsync(uploadUrl, imageUri, {
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      "Content-Type": "image/jpeg",
      Authorization: `Firebase ${idToken}`,
    },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Falha no upload (HTTP ${result.status}): ${result.body}`);
  }

  const parsed = JSON.parse(result.body);
  const token = parsed?.downloadTokens;
  if (!token) throw new Error("Resposta do Storage sem downloadTokens");

  return (
    `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/` +
    `${encodeURIComponent(storagePath)}?alt=media&token=${token}`
  );
}

// Cria uma imagem nova (upload + metadados no Firestore)
export async function criarImagem(
  categoriaId: string,
  titulo: string,
  imageUri: string,
  ordem: number
) {
  const storageUrl = await uploadParaStorage(categoriaId, imageUri);
  return addDoc(imagensRef(categoriaId), {
    titulo,
    storageUrl,
    ordem,
    criadoEm: serverTimestamp(),
  });
}

// Substitui a foto de uma imagem existente (upload nova + deleta antiga)
export async function substituirFotoImagem(
  categoriaId: string,
  imagemId: string,
  novaImageUri: string,
  storageUrlAntiga: string
) {
  const novaUrl = await uploadParaStorage(categoriaId, novaImageUri);

  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");
  const docRef = doc(
    db, "usuarios", uid, "categorias", categoriaId, "imagens", imagemId
  );
  await updateDoc(docRef, { storageUrl: novaUrl });

  // Remove a imagem antiga do Storage
  try {
    const antigaRef = ref(storage, storageUrlAntiga);
    await deleteObject(antigaRef);
  } catch {
    // Ignora se o arquivo antigo já não existe
  }
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
