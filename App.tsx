import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { registerRootComponent } from "expo";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";

// Error Boundary global: captura erros de JavaScript em qualquer componente
// filho e exibe a mensagem na tela em vez de fechar o app
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state: { error: string | null } = { error: null };

  componentDidCatch(error: Error) {
    this.setState({ error: error.message + "\n" + error.stack });
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, padding: 20, marginTop: 50 }}>
          <Text style={{ color: "red", fontWeight: "bold", fontSize: 16 }}>
            ERRO:
          </Text>
          <Text style={{ color: "red", fontSize: 12 }}>{this.state.error}</Text>
        </ScrollView>
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
