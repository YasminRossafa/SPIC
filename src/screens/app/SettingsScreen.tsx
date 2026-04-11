import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

const STORAGE_KEY_BLOQUEIO = "bloqueioSaida";
const STORAGE_KEY_SOM = "semSons";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const [bloqueioSaida, setBloqueioSaida] = useState(false);
  const [semSons, setSemSons] = useState(false);
  const [modalLogout, setModalLogout] = useState(false);

  // Carrega as preferências salvas no AsyncStorage ao montar a tela
  useEffect(() => {
    async function carregarPreferencias() {
      try {
        const bloqueio = await AsyncStorage.getItem(STORAGE_KEY_BLOQUEIO);
        const som = await AsyncStorage.getItem(STORAGE_KEY_SOM);
        if (bloqueio !== null) setBloqueioSaida(bloqueio === "true");
        if (som !== null) setSemSons(som === "true");
      } catch {
        // Silencia erros de leitura — usa valores default
      }
    }
    carregarPreferencias();
  }, []);

  // BackHandler no Android: quando "bloqueioSaida" está ativo,
  // intercepta o botão de voltar do sistema e impede a saída do app.
  // Retornar true no handler significa "eu tratei este evento, não propague".
  useEffect(() => {
    if (Platform.OS !== "android") return;

    function onBackPress() {
      if (bloqueioSaida) return true; // bloqueia o botão voltar
      return false; // comportamento padrão
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [bloqueioSaida]);

  async function toggleBloqueio(value: boolean) {
    setBloqueioSaida(value);
    // Persiste a preferência no AsyncStorage para manter entre sessões
    await AsyncStorage.setItem(STORAGE_KEY_BLOQUEIO, String(value));
  }

  async function toggleSom(value: boolean) {
    setSemSons(value);
    // Persiste a preferência no AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEY_SOM, String(value));
  }

  async function confirmarLogout() {
    setModalLogout(false);
    try {
      await logout();
    } catch {
      // Erro silenciado — o onAuthStateChanged cuida do redirect
    }
  }

  return (
    <View style={styles.container}>
      {/* Bloquear saída do app */}
      <View style={styles.item}>
        <View style={styles.itemTextos}>
          <Text style={styles.itemTitulo}>Bloquear saída do app</Text>
          <Text style={styles.itemDescricao}>
            Impede que a criança saia do app acidentalmente
          </Text>
        </View>
        <Switch
          value={bloqueioSaida}
          onValueChange={toggleBloqueio}
          trackColor={{ false: "#CCCCCC", true: "#3B3BF5" }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.divider} />

      {/* Desativar sons */}
      <View style={styles.item}>
        <View style={styles.itemTextos}>
          <Text style={styles.itemTitulo}>Desativar sons</Text>
          <Text style={styles.itemDescricao}>
            Desliga os sons do app (em breve)
          </Text>
        </View>
        <Switch
          value={semSons}
          onValueChange={toggleSom}
          trackColor={{ false: "#CCCCCC", true: "#3B3BF5" }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Botão de sair da conta */}
      <TouchableOpacity
        style={styles.botaoSair}
        onPress={() => setModalLogout(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.botaoSairTexto}>Sair da conta</Text>
      </TouchableOpacity>

      {/* Modal de confirmação de logout — compatível com web e mobile */}
      <Modal
        visible={modalLogout}
        transparent
        animationType="fade"
        onRequestClose={() => setModalLogout(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalLogout(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitulo}>Sair da conta</Text>
                <Text style={styles.modalMensagem}>Tem certeza que deseja sair?</Text>
                <View style={styles.modalBotoes}>
                  <TouchableOpacity
                    style={styles.modalBotaoCancelar}
                    onPress={() => setModalLogout(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalBotaoCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBotaoSair}
                    onPress={confirmarLogout}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalBotaoSairTexto}>Sair</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  itemTextos: {
    flex: 1,
    marginRight: 16,
  },
  itemTitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  itemDescricao: {
    fontSize: 13,
    color: "#6B6B6B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  botaoSair: {
    backgroundColor: "#D32F2F",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
  },
  botaoSairTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 340,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  modalMensagem: {
    fontSize: 15,
    color: "#6B6B6B",
    marginBottom: 24,
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalBotaoCancelar: {
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalBotaoCancelarTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
  },
  modalBotaoSair: {
    backgroundColor: "#D32F2F",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalBotaoSairTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
