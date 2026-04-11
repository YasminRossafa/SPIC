import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../config/firebase";
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
import { useAuth } from "../../contexts/AuthContext";
import { AuthStackParamList } from "../../navigation/AuthNavigator";

WebBrowser.maybeCompleteAuthSession();

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

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Register">;

// Traduz os códigos de erro do Firebase para mensagens em português
function traduzirErro(code: string): string {
  const erros: Record<string, string> = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres",
    "auth/invalid-email": "E-mail inválido",
  };
  return erros[code] ?? "Ocorreu um erro. Tente novamente.";
}

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { cadastrar, loginComCredential, setNovoCadastro } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);


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
      setNovoCadastro(true);
      loginComCredential(credential)
        .catch((e: any) => {
          setNovoCadastro(false);
          setErro(traduzirErro(e.code));
        })
        .finally(() => setCarregando(false));
    }
  }, [response]);

  // Validações locais antes de chamar o Firebase
  function validar(): string | null {
    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      return "Preencha todos os campos";
    }
    if (senha.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres";
    }
    if (senha !== confirmarSenha) {
      return "As senhas não coincidem";
    }
    return null;
  }

  async function handleCadastrar() {
    setErro("");
    const erroValidacao = validar();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setCarregando(true);
    try {
      await cadastrar(email.trim(), senha, nome.trim());
    } catch (e: any) {
      setErro(traduzirErro(e.code));
    } finally {
      setCarregando(false);
    }
  }

  async function handleCadastrarGoogle() {
    setErro("");
    setCarregando(true);
    try {
      if (Platform.OS === "web") {
        // No navegador: usa popup nativo do Firebase
        const provider = new GoogleAuthProvider();
        setNovoCadastro(true);
        await signInWithPopup(auth, provider);
      } else {
        // No celular: usa expo-auth-session (response tratado no useEffect)
        await promptAsync();
      }
    } catch (error: any) {
      setNovoCadastro(false);
      if (error.code !== "auth/popup-closed-by-user") {
        setErro("Não foi possível cadastrar com o Google. Tente novamente.");
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
          placeholder="Nome completo"
          placeholderTextColor="#9E9E9E"
          autoCapitalize="words"
          value={nome}
          onChangeText={setNome}
          editable={!carregando}
        />

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

        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          placeholderTextColor="#9E9E9E"
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          editable={!carregando}
        />

        {/* Mensagem de erro */}
        {erro !== "" && <Text style={styles.erro}>{erro}</Text>}

        {/* Botão Cadastrar */}
        <TouchableOpacity
          style={[styles.botaoPrimario, carregando && styles.botaoDesabilitado]}
          onPress={handleCadastrar}
          disabled={carregando}
          activeOpacity={0.8}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botaoPrimarioTexto}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        {/* Botão Google */}
        <TouchableOpacity
          style={[styles.botaoGoogle, carregando && styles.botaoDesabilitado]}
          onPress={handleCadastrarGoogle}
          disabled={carregando || !request}
          activeOpacity={0.8}
        >
          <GoogleIcon />
          <Text style={styles.botaoGoogleTexto}>Cadastrar com Google</Text>
        </TouchableOpacity>

        {/* Link para login */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkTexto}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkDestaque}>Faça login!</Text>
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
