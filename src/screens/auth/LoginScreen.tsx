import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { auth } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { AuthStackParamList } from "../../navigation/AuthNavigator";

// Ícone oficial colorido do Google
function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48" style={styles.googleIcone}>
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      <Path fill="none" d="M0 0h48v48H0z" />
    </Svg>
  );
}

// Necessário para fechar o popup do navegador após o login OAuth
WebBrowser.maybeCompleteAuthSession();

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

// Traduz os códigos de erro do Firebase para mensagens em português
function traduzirErro(code: string): string {
  const erros: Record<string, string> = {
    "auth/invalid-credential": "E-mail ou senha incorretos",
    "auth/user-not-found": "Usuário não encontrado",
    "auth/wrong-password": "Senha incorreta",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde",
    "auth/invalid-email": "E-mail inválido",
  };
  return erros[code] ?? "Ocorreu um erro. Tente novamente.";
}

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { login, loginComCredential } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // TODO: Substituir pelo Web client ID do Firebase Console
  // Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID as string,
    redirectUri: AuthSession.makeRedirectUri({
      useProxy: true,
    } as any),
  });

  // Processa a resposta do Google OAuth quando retorna
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setCarregando(true);
      loginComCredential(credential)
        .catch((e: any) => setErro(traduzirErro(e.code)))
        .finally(() => setCarregando(false));
    }
  }, [response]);

  async function handleLogin() {
    setErro("");
    setCarregando(true);
    try {
      await login(email.trim(), senha);
    } catch (e: any) {
      setErro(traduzirErro(e.code));
    } finally {
      setCarregando(false);
    }
  }

  async function handleLoginGoogle() {
    setErro("");
    setCarregando(true);
    try {
      if (Platform.OS === "web") {
        // No navegador: usa popup nativo do Firebase
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } else {
        // No celular: usa expo-auth-session (response tratado no useEffect)
        await promptAsync();
      }
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        setErro("Não foi possível entrar com o Google. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/images/Logo_Spic-sf.png")}
            style={styles.logo}
          />
          <Text style={styles.logoText}>Spic</Text>
        </View>

        {/* Campos de input */}
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#9E9E9E"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!carregando}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#9E9E9E"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          editable={!carregando}
        />

        {/* Mensagem de erro */}
        {erro !== "" && <Text style={styles.erro}>{erro}</Text>}

        {/* Botão Entrar */}
        <TouchableOpacity
          style={[styles.botaoPrimario, carregando && styles.botaoDesabilitado]}
          onPress={handleLogin}
          disabled={carregando}
          activeOpacity={0.8}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botaoPrimarioTexto}>Entrar</Text>
          )}
        </TouchableOpacity>

        {/* Botão Google */}
        <TouchableOpacity
          style={[styles.botaoGoogle, carregando && styles.botaoDesabilitado]}
          onPress={handleLoginGoogle}
          disabled={carregando || !request}
          activeOpacity={0.8}
        >
          <GoogleIcon />
          <Text style={styles.botaoGoogleTexto}>Entrar com Google</Text>
        </TouchableOpacity>

        {/* Link para cadastro */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkTexto}>Ainda não é cadastrado? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.linkDestaque}>Cadastre-se!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#3B3BF5",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  erro: {
    color: "#D32F2F",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  botaoPrimario: {
    backgroundColor: "#3B3BF5",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoPrimarioTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  botaoGoogle: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  googleIcone: {
    marginRight: 8,
  },
  botaoGoogleTexto: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  linkTexto: {
    fontSize: 14,
    color: "#6B6B6B",
  },
  linkDestaque: {
    fontSize: 14,
    color: "#3B3BF5",
    fontWeight: "bold",
  },
});
