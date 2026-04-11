import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase";

// Login com e-mail e senha
export async function login(email: string, senha: string) {
  return signInWithEmailAndPassword(auth, email, senha);
}

// Cadastro com e-mail, senha e nome
export async function cadastrar(email: string, senha: string, nome: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, senha);
  await updateProfile(user, { displayName: nome });
  return user;
}

// Logout
export async function logout() {
  return signOut(auth);
}
