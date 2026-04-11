import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Imagem } from "../types";

interface ImageCardProps {
  imagem: Imagem;
}

// Card de imagem com título 
export default function ImageCard({ imagem }: ImageCardProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: imagem.storageUrl }} style={styles.image} />
      <Text style={styles.titulo}>{imagem.titulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 120,
    resizeMode: "cover",
  },
  titulo: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    padding: 10,
    textAlign: "center",
  },
});
