import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { excluirCategoria, ouvirCategorias } from "../../services/categoryService";
import { excluirImagem, ouvirImagens } from "../../services/imageService";
import { Categoria, Imagem } from "../../types";
import MenuDrawer from "./MenuScreen";

type NavigationProp = NativeStackNavigationProp<AppStackParamList, "Home">;

// Tipo do item selecionado para exclusão via modal
interface ItemParaExcluir {
  tipo: "imagem" | "categoria";
  categoriaId: string;
  imagemId?: string;
  storageUrl?: string;
  nome: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { height } = useWindowDimensions();

  // Altura de cada imagem: metade da tela menos espaço para header e título
  const alturaImagem = height / 2 - 130;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [imagensPorCategoria, setImagensPorCategoria] = useState<Record<string, Imagem[]>>({});
  const [menuVisible, setMenuVisible] = useState(false);

  // Estado do modal de exclusão
  const [modalVisivel, setModalVisivel] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<ItemParaExcluir | null>(null);

  // Ref para guardar os unsubscribes dos listeners de imagens
  const imagensUnsubs = useRef<Record<string, () => void>>({});

  // Listener em tempo real para categorias
  useEffect(() => {
    if (!user) return;
    const unsub = ouvirCategorias((cats) => setCategorias(cats));
    return () => unsub();
  }, [user]);

  // Quando uma categoria é expandida, inicia listener de imagens
  useEffect(() => {
    if (!expandedId) return;

    // Evita criar listener duplicado
    if (imagensUnsubs.current[expandedId]) return;

    const unsub = ouvirImagens(expandedId, (imgs) => {
      setImagensPorCategoria((prev) => ({ ...prev, [expandedId]: imgs }));
    });
    imagensUnsubs.current[expandedId] = unsub;

    return () => {
      // Cleanup ao desmontar (não ao recolher, para manter cache)
    };
  }, [expandedId]);

  // Cleanup de todos os listeners de imagens ao desmontar
  useEffect(() => {
    return () => {
      Object.values(imagensUnsubs.current).forEach((unsub) => unsub());
    };
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // Long press na categoria — abre modal de confirmação
  function handleDeleteCategoria(categoria: Categoria) {
    setItemParaExcluir({
      tipo: "categoria",
      categoriaId: categoria.id,
      nome: categoria.nome,
    });
    setModalVisivel(true);
  }

  // Long press na imagem — abre modal de confirmação
  function handleDeleteImagem(categoriaId: string, imagem: Imagem) {
    setItemParaExcluir({
      tipo: "imagem",
      categoriaId,
      imagemId: imagem.id,
      storageUrl: imagem.storageUrl,
      nome: imagem.titulo,
    });
    setModalVisivel(true);
  }

  // Executa a exclusão após confirmação no modal
  async function confirmarExclusao() {
    if (!itemParaExcluir) return;
    try {
      if (itemParaExcluir.tipo === "imagem") {
        await excluirImagem(
          itemParaExcluir.categoriaId,
          itemParaExcluir.imagemId!,
          itemParaExcluir.storageUrl!
        );
      } else {
        // Remove listener de imagens dessa categoria antes de excluir
        imagensUnsubs.current[itemParaExcluir.categoriaId]?.();
        delete imagensUnsubs.current[itemParaExcluir.categoriaId];
        setImagensPorCategoria((prev) => {
          const copy = { ...prev };
          delete copy[itemParaExcluir.categoriaId];
          return copy;
        });
        if (expandedId === itemParaExcluir.categoriaId) setExpandedId(null);
        await excluirCategoria(itemParaExcluir.categoriaId);
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
    } finally {
      setModalVisivel(false);
      // Não limpa itemParaExcluir aqui — evita que o texto do modal
      // mude durante a animação de fade out
    }
  }

  // Renderiza a grade de imagens dentro de uma categoria expandida
  function renderImagens(categoriaId: string) {
    const imagens = imagensPorCategoria[categoriaId] ?? [];

    return (
      <View style={styles.imagensContainer}>
        <View style={styles.imagensGrid}>
          {imagens.map((img) => (
            <TouchableOpacity
              key={img.id}
              style={styles.imagemWrapper}
              onLongPress={() => handleDeleteImagem(categoriaId, img)}
              delayLongPress={500}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: img.storageUrl }}
                style={[styles.imagemThumb, { height: alturaImagem }]}
              />
              <Text style={styles.imagemTitulo} numberOfLines={1}>
                {img.titulo}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Botão de adicionar imagem */}
          <TouchableOpacity
            style={styles.addImagemBtn}
            onPress={() => navigation.navigate("NewImage", { categoriaId })}
            activeOpacity={0.7}
          >
            <Text style={styles.addImagemTexto}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Renderiza cada card de categoria
  function renderCategoria({ item }: { item: Categoria }) {
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.categoriaCard}>
        {/* Header da categoria: toque para expandir, long press para excluir */}
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)}
          onLongPress={() => handleDeleteCategoria(item)}
          delayLongPress={500}
          activeOpacity={0.8}
        >
          <View style={styles.categoriaHeader}>
            <Text style={styles.categoriaNome}>{item.nome}</Text>
            <Text style={styles.chevron}>{isExpanded ? "▲" : "▼"}</Text>
          </View>
        </TouchableOpacity>
        {isExpanded && renderImagens(item.id)}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header customizado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.headerIcon}>≡</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spic</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="settings-outline" size={24} color="#3B3BF5" />
        </TouchableOpacity>
      </View>

      {/* Lista de categorias */}
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoria}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhuma categoria criada ainda.{"\n"}Toque no botão + para começar!
            </Text>
          </View>
        }
      />

      {/* FAB — botão flutuante de adicionar categoria */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("NewCategory")}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Menu lateral (drawer animado) */}
      <MenuDrawer visible={menuVisible} onClose={() => setMenuVisible(false)} />

      {/* Modal de confirmação de exclusão — compatível com web e mobile */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisivel(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitulo}>
                  {itemParaExcluir?.tipo === "imagem"
                    ? "Excluir imagem"
                    : "Excluir categoria"}
                </Text>
                <Text style={styles.modalMensagem}>
                  {itemParaExcluir?.tipo === "imagem"
                    ? "Deseja excluir esta imagem?"
                    : "Todas as imagens desta categoria serão removidas. Tem certeza?"}
                </Text>
                <View style={styles.modalBotoes}>
                  <TouchableOpacity
                    style={styles.modalBotaoCancelar}
                    onPress={() => setModalVisivel(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalBotaoCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBotaoExcluir}
                    onPress={confirmarExclusao}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalBotaoExcluirTexto}>Excluir</Text>
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
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerIcon: {
    fontSize: 26,
    color: "#3B3BF5",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3B3BF5",
  },
  listContent: {
    paddingVertical: 12,
  },
  categoriaCard: {
    backgroundColor: "#EEEEEE",
    borderRadius: 10,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
  },
  categoriaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoriaNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    flex: 1,
  },
  chevron: {
    fontSize: 16,
    color: "#6B6B6B",
    marginLeft: 8,
  },
  imagensContainer: {
    marginTop: 12,
  },
  imagensGrid: {
    gap: 12,
  },
  imagemWrapper: {
    width: "100%",
    alignItems: "center",
  },
  imagemThumb: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#D9D9D9",
  },
  imagemTitulo: {
    fontSize: 20,
    color: "#1A1A1A",
    marginTop: 4,
    textAlign: "center",
    width: "100%",
  },
  addImagemBtn: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#AAAAAA",
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
  },
  addImagemTexto: {
    fontSize: 24,
    color: "#AAAAAA",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3B3BF5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 30,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: -2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B6B6B",
    textAlign: "center",
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  modalMensagem: {
    fontSize: 14,
    color: "#555555",
    marginTop: 8,
  },
  modalBotoes: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  modalBotaoCancelar: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  modalBotaoCancelarTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  modalBotaoExcluir: {
    flex: 1,
    backgroundColor: "#D32F2F",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  modalBotaoExcluirTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
