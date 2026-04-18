import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../config/firebase";
import { AuthCredential } from "firebase/auth";

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;

// Configura o Google Sign-In nativo uma única vez (Android/iOS).
if (Platform.OS !== "web") {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
}

// Executa o fluxo de login com Google e retorna a credential do Firebase.
// No web usa popup; no mobile usa o SDK nativo do Google.
// Retorna null se o usuário cancelou o fluxo.
export async function obterCredentialGoogle(): Promise<AuthCredential | null> {
  if (Platform.OS === "web") {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // signInWithPopup já autentica direto — retorna null para indicar
    // que o caller não precisa chamar loginComCredential
    return null;
  }

  // Mobile: SDK nativo do Google
  await GoogleSignin.hasPlayServices();
  // Desloga sessão anterior para sempre exibir o seletor de contas
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignora se não havia sessão
  }

  const info: any = await GoogleSignin.signIn();
  const idToken = info?.data?.idToken ?? info?.idToken;
  if (!idToken) throw new Error("Sem idToken do Google");

  return GoogleAuthProvider.credential(idToken);
}
