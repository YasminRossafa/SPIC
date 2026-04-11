import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

// Habilita LayoutAnimation no Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FaqItem {
  pergunta: string;
  resposta: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    pergunta: "O PECS atrasa o desenvolvimento da fala?",
    resposta:
      "Não. Estudos mostram que o PECS não atrasa a fala — pelo contrário, pode até estimulá-la! Muitas crianças começam a vocalizar durante o uso do método, especialmente nas fases em que o adulto nomeia os itens ao entregar. O PECS reduz a frustração e a ansiedade, criando um ambiente mais favorável para a comunicação. A fala, quando surge, acontece de forma espontânea e significativa.",
  },
  {
    pergunta: "Qual a idade ideal para começar a usar o PECS?",
    resposta:
      "O PECS pode ser introduzido a partir dos 18 meses, mas é mais comumente iniciado entre 2 e 5 anos. Não há idade máxima — adolescentes e adultos com dificuldades de comunicação também se beneficiam do método. O mais importante é que a criança demonstre interesse em objetos ou atividades que possam servir como motivação para a comunicação.",
  },
  {
    pergunta: "Posso usar o PECS em casa, mesmo sem ser profissional?",
    resposta:
      "Sim, familiares têm papel fundamental no sucesso do PECS! Pesquisas mostram que crianças cujos pais participam ativamente da intervenção apresentam resultados significativamente melhores. Porém, é muito importante buscar orientação de um fonoaudiólogo ou terapeuta treinado antes de começar, para aplicar o método corretamente e evitar erros que possam atrapalhar o progresso.",
  },
  {
    pergunta: "O PECS substitui a fala ou outros métodos de comunicação?",
    resposta:
      "Não. O PECS é um sistema de comunicação alternativa e aumentativa — ele complementa, não substitui. O objetivo final é sempre ampliar as possibilidades de comunicação da criança, seja por fala, gestos, imagens ou combinações de tudo isso. Ele é especialmente útil para crianças que ainda não desenvolveram comunicação verbal funcional.",
  },
  {
    pergunta: "Quantas figuras devo começar usando?",
    resposta:
      "O ideal é começar com poucas figuras — entre 2 e 3 itens que a criança realmente deseja muito, como um alimento favorito ou um brinquedo preferido. Começar com muitas figuras pode confundir e desmotivar. À medida que a criança domina a troca, o vocabulário é ampliado gradualmente, sempre respeitando o ritmo dela.",
  },
  {
    pergunta: "Com que frequência devo praticar o PECS?",
    resposta:
      "A prática deve ser frequente e integrada à rotina do dia a dia, não restrita a sessões formais. Aproveite momentos naturais como refeições, brincadeiras e hora do banho para usar as figuras. Consistência é mais importante que duração — sessões curtas e frequentes ao longo do dia são mais eficazes do que uma sessão longa isolada.",
  },
  {
    pergunta: "As imagens precisam ser desenhos ou podem ser fotos reais?",
    resposta:
      "Pesquisas indicam que imagens reais e personalizadas — como fotos dos próprios objetos, alimentos e pessoas da rotina da criança — facilitam a generalização do aprendizado. Por isso o SPIC foi pensado para que você use fotos reais da família e dos itens do dia a dia, tornando o sistema mais significativo e eficaz para cada criança.",
  },
  {
    pergunta: "O que faço se a criança não demonstrar interesse nas figuras?",
    resposta:
      "Isso é comum no início! Tente identificar itens de altíssima motivação — algo que a criança queira muito naquele momento. O PECS funciona melhor quando o reforço (o item entregue após a troca da figura) é realmente desejado pela criança. Se a dificuldade persistir, consulte o terapeuta responsável para ajustar a abordagem.",
  },
];

export default function FaqScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  function toggleExpand(index: number) {
    // Anima a transição de expand/collapse suavemente
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex((prev) => (prev === index ? null : index));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {FAQ_DATA.map((item, index) => {
        const isExpanded = expandedIndex === index;

        return (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => toggleExpand(index)}
            activeOpacity={0.7}
          >
            <View style={styles.perguntaRow}>
              <Text style={styles.perguntaTexto}>{item.pergunta}</Text>
              <Text style={styles.chevron}>{isExpanded ? "▲" : "▼"}</Text>
            </View>

            {isExpanded && (
              <Text style={styles.respostaTexto}>
                <Text style={styles.respostaLabel}>Resposta: </Text>
                {item.resposta}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 16,
    marginVertical: 6,
  },
  perguntaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  perguntaTexto: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "600",
    flex: 1,
    paddingRight: 12,
  },
  chevron: {
    fontSize: 14,
    color: "#6B6B6B",
  },
  respostaTexto: {
    fontSize: 14,
    color: "#444444",
    lineHeight: 22,
    paddingTop: 10,
  },
  respostaLabel: {
    fontWeight: "bold",
  },
});
