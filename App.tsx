import { NavigationContainer } from "@react-navigation/native";
import { registerRootComponent } from "expo";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";

// Error Boundary global: captura erros de JavaScript em qualquer componente filho
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state: { error: string | null } = { error: null };

  componentDidCatch() {}

  static getDerivedStateFromError() {
    return { error: "Algo deu errado" };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1A1A1A", marginBottom: 8 }}>
            Ops! Algo deu errado.
          </Text>
          <Text style={{ fontSize: 14, color: "#6B6B6B", textAlign: "center" }}>
            Feche e abra o aplicativo novamente.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Componente que decide qual navegação exibir com base no estado de autenticação
function Routes() {
  const { user, loading, tutorialVisto } = useAuth();

  // Mostra indicador de carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B7DD8" />
      </View>
    );
  }

  if (!user) return <AuthNavigator />;

  // Se o tutorial ainda não foi visto, abre o Guide; caso contrário, vai para Home
  return <AppNavigator initialRoute={tutorialVisto ? "Home" : "Guide"} />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Registra o componente raiz para o Expo (substituindo expo-router)
registerRootComponent(App);

export default App;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
