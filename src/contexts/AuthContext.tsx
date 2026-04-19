import {
  AuthCredential,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { User } from "../types";

interface AuthContextData {
  user: User | null;
  loading: boolean;
  novoCadastro: boolean;
  setNovoCadastro: (value: boolean) => void;
  tutorialVisto: boolean;
  setTutorialVisto: (value: boolean) => void;
  login: (email: string, senha: string) => Promise<void>;
  loginComCredential: (credential: AuthCredential) => Promise<void>;
  cadastrar: (email: string, senha: string, nome: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Hook para acessar o contexto de autenticação em qualquer componente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

// Converte o usuário do Firebase para o tipo User do app
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    nome: firebaseUser.displayName ?? "",
    email: firebaseUser.email ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tutorialVisto, setTutorialVisto] = useState(false);
  const [novoCadastro, setNovoCadastro] = useState(false);

  // Ouve mudanças no estado de autenticação do Firebase
  // e verifica se o tutorial já foi visto no Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let visto = false;
        try {
          const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid));
          visto = userDoc.data()?.tutorialVisto === true;
        } catch {
          visto = false;
        }
        setUser(mapFirebaseUser(firebaseUser));
        setTutorialVisto(visto);
      } else {
        setUser(null);
        setTutorialVisto(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login com e-mail e senha
  async function login(email: string, senha: string) {
    await signInWithEmailAndPassword(auth, email, senha);
  }

  // Login com Google 
  async function loginComCredential(credential: AuthCredential) {
    await signInWithCredential(auth, credential);
  }

  // Cadastro com e-mail, senha e nome
  async function cadastrar(email: string, senha: string, nome: string) {
    setNovoCadastro(true);
    const { user: firebaseUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );
    // Atualiza o nome no perfil do Firebase
    const { updateProfile } = await import("firebase/auth");
    await updateProfile(firebaseUser, { displayName: nome });
    setUser({ uid: firebaseUser.uid, nome, email });
  }

  // Logout
  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, novoCadastro, setNovoCadastro, tutorialVisto, setTutorialVisto, login, loginComCredential, cadastrar, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
