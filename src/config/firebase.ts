import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
// @ts-ignore - getReactNativePersistence não está nos tipos mas existe no runtime
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

// Configuração do Firebase — valores hardcoded temporariamente para diagnóstico
const firebaseConfig = {
  apiKey: "AIzaSyCLmK2wMM7oj293QcMikuzpSUbOjAkOvcU",
  authDomain: "spic-8a6ca.firebaseapp.com",
  projectId: "spic-8a6ca",
  storageBucket: "spic-8a6ca.firebasestorage.app",
  messagingSenderId: "1008645452527",
  appId: "1:1008645452527:web:9e8b5dd8faac65a502a11a",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços para uso em toda a aplicação
// No mobile, usa AsyncStorage para manter o login entre sessões
export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
