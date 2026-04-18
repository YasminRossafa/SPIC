import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
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
import GoogleIcon from "../../components/GoogleIcon";
import { useAuth } from "../../contexts/AuthContext";
import { obterCredentialGoogle } from "../../services/googleAuthService";
import { AuthStackParamList } from "../../navigation/AuthNavigator";

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
  const [senhaEnviada, setSenhaEnviada] = useState(false);

  async function handleLogin() {
    setErro("");
    setSenhaEnviada(false);
    if (!email.trim() || !senha) {
      setErro("Preencha todos os campos");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErro("E-mail inválido");
      return;
    }
    setCarregando(true);
    try {
      await login(email.trim(), senha);
    } catch (e: any) {
      setErro(traduzirErro(e.code));
    } finally {
      setCarregando(false);
    }
  }

  async function handleEsqueciSenha() {
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErro("Digite seu e-mail no campo acima para recuperar a senha.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setErro("Digite um e-mail válido para recuperar a senha.");
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      // Usa REST API diretamente — o SDK sendPasswordResetEmail trava no web
      const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestType: "PASSWORD_RESET",
            email: emailTrimmed,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        const code = data?.error?.message;
        if (code === "EMAIL_NOT_FOUND") {
          setErro("Nenhuma conta encontrada com este e-mail.");
        } else {
          setErro("Não foi possível enviar o e-mail. Tente novamente.");
        }
        return;
      }
      setSenhaEnviada(true);
    } catch (e) {
      console.error("Erro ao enviar e-mail de recuperação:", e);
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleLoginGoogle() {
    setErro("");
    setCarregando(true);
    try {
      const credential = await obterCredentialGoogle();
      // credential é null no web (signInWithPopup já autentica direto)
      if (credential) await loginComCredential(credential);
    } catch (error: any) {
      if (
        error.code !== "auth/popup-closed-by-user" &&
        error.code !== "SIGN_IN_CANCELLED"
      ) {
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

        {/* Link esqueci minha senha */}
        <TouchableOpacity onPress={handleEsqueciSenha} style={styles.esqueciSenhaContainer}>
          <Text style={styles.esqueciSenhaTexto}>Esqueci minha senha</Text>
        </TouchableOpacity>

        {/* Mensagem de sucesso (recuperação de senha) */}
        {senhaEnviada && (
          <Text style={styles.sucesso}>
            E-mail enviado! Verifique sua caixa de entrada para redefinir a senha.
          </Text>
        )}

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
          disabled={carregando}
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
  sucesso: {
    color: "#2E7D32",
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
  esqueciSenhaContainer: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  esqueciSenhaTexto: {
    fontSize: 14,
    color: "#3B3BF5",
    fontWeight: "500",
  },
});
