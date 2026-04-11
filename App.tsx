import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { registerRootComponent } from "expo";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";

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
    <AuthProvider>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </AuthProvider>
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
