import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const SCREEN_WIDTH = Dimensions.get("window").width;
const MENU_WIDTH = SCREEN_WIDTH * 0.75;

interface MenuDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const CONTACT_EMAIL = "yasminrossafa85@estudante.ufscar.br";

export default function MenuDrawer({ visible, onClose }: MenuDrawerProps) {
  const navigation = useNavigation<NavigationProp>();

  // Animated value para deslizar o menu da esquerda (-MENU_WIDTH → 0)
  const translateX = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Controla desmontagem após animação de fechamento para liberar o layout
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -MENU_WIDTH,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [visible]);

  // Navega e fecha o menu
  function navigateTo(screen: keyof AppStackParamList) {
    onClose();
    if (screen === "Home") return; // já está na Home
    navigation.navigate(screen as any);
  }

  // Não renderiza nada quando totalmente fechado — libera o layout da tela
  if (!rendered && !visible) {
    return null;
  }

  return (
    <View style={styles.root} pointerEvents={visible ? "auto" : "none"}>
      {/* Overlay escuro — fecha o menu ao tocar */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Menu deslizante */}
      <Animated.View style={[styles.menu, { transform: [{ translateX }] }]}>
        <SafeAreaView style={styles.menuInner}>
          {/* Logo no topo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/images/Logo_Spic-sf.png")}
              style={styles.logo}
            />
            <Text style={styles.logoText}>Spic</Text>
          </View>

          {/* Itens de navegação */}
          <View style={styles.navItems}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo("Home")}>
              <Text style={styles.navIcon}>🏠</Text>
              <Text style={styles.navLabel}>Início</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo("Guide")}>
              <Text style={styles.navIcon}>📖</Text>
              <Text style={styles.navLabel}>Guia</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo("Faq")}>
              <Text style={styles.navIcon}>❓</Text>
              <Text style={styles.navLabel}>Perguntas</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo("Settings")}>
              <Text style={styles.navIcon}>⚙️</Text>
              <Text style={styles.navLabel}>Ajustes</Text>
            </TouchableOpacity>
          </View>

          {/* Rodapé — Contato */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>Contato</Text>

            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
              <Text style={styles.contatoLink}>✉️ Enviar e-mail</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL("https://www.ufscar.br")}>
              <Text style={styles.contatoLink}>🎓 UFSCar Sorocaba</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  menu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: MENU_WIDTH,
    backgroundColor: "#F5F5F5",
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuInner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 12,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3B3BF5",
  },
  navItems: {
    flex: 1,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  navIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  navLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B3BF5",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  footer: {
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 16,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  footerItem: {
    fontSize: 14,
    color: "#3B3BF5",
    marginBottom: 8,
  },
  contatoLink: {
    fontSize: 15,
    color: "#3B3BF5",
    marginTop: 8,
  },
});
