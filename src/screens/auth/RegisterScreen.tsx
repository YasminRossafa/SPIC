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


  // Validações locais antes de chamar o Firebase
  function validar(): string | null {
    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      return "Preencha todos os campos";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "E-mail inválido";
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
      setNovoCadastro(true);
      const credential = await obterCredentialGoogle();
      // credential é null no web (signInWithPopup já autentica direto)
      if (credential) await loginComCredential(credential);
    } catch (error: any) {
      setNovoCadastro(false);
      if (
        error.code !== "auth/popup-closed-by-user" &&
        error.code !== "SIGN_IN_CANCELLED"
      ) {
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
          disabled={carregando}
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
