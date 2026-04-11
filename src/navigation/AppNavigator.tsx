import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GuideScreen from "../screens/onboarding/GuideScreen";
import HomeScreen from "../screens/app/HomeScreen";
import NewCategoryScreen from "../screens/app/NewCategoryScreen";
import NewImageScreen from "../screens/app/NewImageScreen";
import FaqScreen from "../screens/app/FaqScreen";
import SettingsScreen from "../screens/app/SettingsScreen";

// Tipagem das rotas do app (após login)
// Menu é um drawer animado dentro da HomeScreen, não uma rota separada
export type AppStackParamList = {
  Guide: undefined;
  Home: undefined;
  NewCategory: undefined;
  NewImage: { categoriaId: string };
  Faq: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

// Navegação exibida quando o usuário ESTÁ logado
export default function AppNavigator({ initialRoute = "Home" }: { initialRoute?: keyof AppStackParamList }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: true,
        headerTintColor: "#3B7DD8",
        headerTitleStyle: { color: "#1A1A1A", fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="Guide"
        component={GuideScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewCategory"
        component={NewCategoryScreen}
        options={{ title: "Nova Categoria" }}
      />
      <Stack.Screen
        name="NewImage"
        component={NewImageScreen}
        options={{ title: "Nova Imagem" }}
      />
      <Stack.Screen
        name="Faq"
        component={FaqScreen}
        options={{ title: "FAQ" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Configurações" }}
      />
    </Stack.Navigator>
  );
}
