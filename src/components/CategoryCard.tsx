import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Categoria } from "../types";

interface CategoryCardProps {
  categoria: Categoria;
  onPress: () => void;
}

// Card de categoria expansível — será implementado visualmente depois
export default function CategoryCard({
  categoria,
  onPress,
}: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.nome}>{categoria.nome}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nome: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});
