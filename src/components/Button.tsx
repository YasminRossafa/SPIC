import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}

export default function Button({
  label,
  onPress,
  variant = "primary",
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={[styles.base, isPrimary ? styles.primary : styles.secondary]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          isPrimary ? styles.labelPrimary : styles.labelSecondary,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  primary: {
    backgroundColor: "#3B7DD8",
  } as ViewStyle,
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#3B7DD8",
  } as ViewStyle,
  label: {
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,
  labelPrimary: {
    color: "#FFFFFF",
  } as TextStyle,
  labelSecondary: {
    color: "#3B7DD8",
  } as TextStyle,
});
