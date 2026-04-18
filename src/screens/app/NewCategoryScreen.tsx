import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { criarCategoria, listarCategorias } from "../../services/categoryService";

export default function NewCategoryScreen() {
  const navigation = useNavigation();
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar() {
    const nomeTrimmed = nome.trim();
    if (!nomeTrimmed) {
      Alert.alert("Atenção", "O nome da categoria não pode estar vazio.");
      return;
    }

    setSalvando(true);
    try {
      const existentes = await listarCategorias();
      const maiorOrdem = existentes.reduce((max, c) => Math.max(max, c.ordem), 0);
      await criarCategoria(nomeTrimmed, maiorOrdem + 1);
      navigation.goBack();
    } catch {
      Alert.alert("Erro", "Não foi possível criar a categoria. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome da categoria</Text>

      <TextInput
        style={styles.input}
        placeholder="Ex: Alimentos, Brinquedos..."
        placeholderTextColor="#9E9E9E"
        value={nome}
        onChangeText={setNome}
        autoFocus
        editable={!salvando}
      />

      {/* Botões */}
      <TouchableOpacity
        style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
        onPress={handleSalvar}
        disabled={salvando}
        activeOpacity={0.8}
      >
        {salvando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.botaoSalvarTexto}>Salvar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoCancelar}
        onPress={() => navigation.goBack()}
        disabled={salvando}
        activeOpacity={0.8}
      >
        <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
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
    marginBottom: 24,
  },
  botaoSalvar: {
    backgroundColor: "#3B3BF5",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoSalvarTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  botaoCancelar: {
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  botaoCancelarTexto: {
    color: "#555555",
    fontSize: 16,
    fontWeight: "600",
  },
});
