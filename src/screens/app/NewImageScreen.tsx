import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { criarImagem } from "../../services/imageService";
import { AppStackParamList } from "../../navigation/AppNavigator";

type NewImageRoute = RouteProp<AppStackParamList, "NewImage">;

export default function NewImageScreen() {
  const navigation = useNavigation();
  const route = useRoute<NewImageRoute>();
  const { categoriaId } = route.params;

  const [titulo, setTitulo] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Abre o image picker com opções de galeria e câmera
  async function handleEscolherFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  // Abre a câmera diretamente
  async function handleTirarFoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à câmera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSalvar() {
    const tituloTrimmed = titulo.trim();
    if (!tituloTrimmed) {
      Alert.alert("Atenção", "Preencha o título da imagem.");
      return;
    }
    if (!imageUri) {
      Alert.alert("Atenção", "Escolha uma foto antes de salvar.");
      return;
    }

    setSalvando(true);
    try {
      // Upload para Storage + salva metadados no Firestore
      await criarImagem(categoriaId, tituloTrimmed, imageUri, Date.now());
      navigation.goBack();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a imagem. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Título da imagem</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Bola, Mamãe, Água..."
        placeholderTextColor="#9E9E9E"
        value={titulo}
        onChangeText={setTitulo}
        editable={!salvando}
      />

      {/* Preview da imagem selecionada */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={styles.previewPlaceholder}>
          <Text style={styles.previewPlaceholderText}>Nenhuma foto selecionada</Text>
        </View>
      )}

      {/* Botões para escolher foto */}
      <View style={styles.fotoBotoes}>
        <TouchableOpacity
          style={styles.botaoFoto}
          onPress={handleEscolherFoto}
          disabled={salvando}
          activeOpacity={0.8}
        >
          <Ionicons name="images-outline" size={20} color="#3B3BF5" style={{ marginRight: 6 }} />
          <Text style={styles.botaoFotoTexto}>Escolher da galeria</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoFoto}
          onPress={handleTirarFoto}
          disabled={salvando}
          activeOpacity={0.8}
        >
          <Text style={styles.botaoFotoTexto}>📸 Câmera</Text>
        </TouchableOpacity>
      </View>

      {/* Botão Salvar */}
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
    marginBottom: 20,
  },
  preview: {
    width: 150,
    height: 150,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 16,
    backgroundColor: "#D9D9D9",
  },
  previewPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 16,
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderStyle: "dashed",
  },
  previewPlaceholderText: {
    fontSize: 13,
    color: "#9E9E9E",
    textAlign: "center",
  },
  fotoBotoes: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  botaoFoto: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  botaoFotoTexto: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "500",
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
