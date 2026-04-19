import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { AppStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<AppStackParamList, "Guide">;

const TOTAL_PAGES = 4;

// Conteúdo de cada página do tutorial
const pages = [
  {
    title: "Seja bem-vindo(a) ao Spic!",
    titleBold: true,
    content: `O SPIC é um aplicativo criado para apoiar a comunicação de crianças com autismo ou outras dificuldades de fala, usando figuras e fotos da rotina delas.

Aqui, você vai poder:
• Criar categorias personalizadas (como "Almoço" ou "Brinquedos")
• Adicionar fotos reais da criança e da família
• Organizar tudo do jeito que faz sentido para o dia a dia

Este app foi desenvolvido com base no método PECS (Picture Exchange Communication System), um sistema comprovado que ensina a criança a iniciar a comunicação por conta própria.

Vamos conhecer um pouco mais?`,
  },
  {
    title: null,
    titleBold: false,
    content: `O PECS é um sistema de comunicação por troca de figuras, criado especialmente para ajudar pessoas que têm dificuldade para falar ou se comunicar.

Como funciona na prática:
• A criança vê algo que deseja (um brinquedo, um alimento)
• Ela pega a figura correspondente
• Entrega a figura para o adulto
• O adulto nomeia o item ("bola!") e entrega imediatamente

Assim, a criança aprende que, ao entregar a figura, ela consegue o que quer, então começa a se comunicar de forma intencional!

O método é dividido em fases, começando com pedidos simples e evoluindo até formar frases e fazer comentários.`,
  },
  {
    title: "⚠️ Atenção: leia com cuidado!",
    titleBold: true,
    content: `O PECS é um método estruturado e baseado em ciência. Para funcionar direitinho, precisa ser aplicado corretamente.

Muito importante:
• Este aplicativo é uma ferramenta de apoio para quem já conhece o método ou está aprendendo com supervisão
• Se você não é fonoaudiólogo ou não tem formação em PECS, procure orientação profissional antes de iniciar
• Aplicar do jeito errado pode atrapalhar o progresso da criança

Dicas para começar bem:
• Use poucas figuras no início (2 ou 3)
• Escolha itens que a criança realmente goste
• Sempre fale o nome do item ao entregar
• Respeite o tempo da criança — cada uma tem seu ritmo`,
  },
  {
    title: "Aprenda com quem criou o método",
    titleBold: true,
    content: `O treinamento oficial PECS é oferecido pela Pyramid Educational Consultants, a organização fundada pelos criadores do método, Andy Bondy e Lori Frost.

Por que fazer o curso?
• Aprenda a aplicar as 6 fases do PECS corretamente
• Entenda como motivar a criança a se comunicar
• Receba certificação reconhecida internacionalmente

Quem pode fazer:
O curso é aberto a profissionais e familiares que desejam aprender a usar o PECS de forma eficaz.`,
    hasLink: true,
  },
];

export default function GuideScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, setTutorialVisto } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const isLastPage = currentPage === TOTAL_PAGES - 1;

  // Avança para próxima página ou finaliza o tutorial
  async function handleNext() {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1);
      return;
    }

    // Última página: salva no Firestore e navega para Home
    if (!user) return;
    setSalvando(true);
    try {
      await setDoc(
        doc(db, "usuarios", user.uid),
        { tutorialVisto: true },
        { merge: true }
      );
      setTutorialVisto(true);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch {
      // Se falhar a gravação, ainda permite avançar para não travar o usuário
      setTutorialVisto(true);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } finally {
      setSalvando(false);
    }
  }

  const page = pages[currentPage];

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/images/Logo_Spic-sf.png")}
          style={styles.logo}
        />
        <Text style={styles.logoText}>Spic</Text>
      </View>

      {/* Indicador de progresso: 4 bolinhas */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentPage && styles.dotActive]}
          />
        ))}
      </View>

      {/* Conteúdo da página */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card semitransparente envolvendo o conteúdo */}
        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <View style={styles.cardInner}>
            {page.title && (
              <Text style={[styles.title, page.titleBold && styles.titleBold]}>
                {page.title}
              </Text>
            )}

            <Text style={styles.content}>{page.content}</Text>

            {/* Link para cursos PECS na última página */}
            {page.hasLink && (
              <TouchableOpacity
                onPress={() => Linking.openURL("https://pecs-brazil.com/ver-todos-os-cursos/")}
                activeOpacity={0.7}
              >
                <Text style={styles.link}>👉 Cursos da Pyramid Brasil</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Botão Próximo / Começar */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
        disabled={salvando}
        activeOpacity={0.8}
      >
        {salvando ? (
          <ActivityIndicator color="#1A1A3E" />
        ) : (
          <Text style={styles.buttonText}>
            {isLastPage ? "Vamos Lá!" : "Próximo"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A3E",
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  titleBold: {
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    overflow: "hidden",
  },
  cardAccent: {
    height: 3,
    backgroundColor: "#3B3BF5",
  },
  cardInner: {
    padding: 20,
  },
  content: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 26,
    textAlign: "justify",
  },
  link: {
    fontSize: 16,
    color: "#93C5FD",
    fontWeight: "bold",
    marginTop: 16,
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#1A1A3E",
    fontSize: 16,
    fontWeight: "bold",
  },
});
