// src/navigation/RootNavigator.tsx
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import AuthScreen from "../screens/AuthScreen";
import MainTabs from "./MainTabs";
import TeacherTabs from "./TeacherTabs";
import { colors } from "../theme/colors";

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    border: colors.border,
    primary: colors.teal,
    text: colors.text,
  },
};

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {!user ? <AuthScreen /> : user.role === "teacher" ? <TeacherTabs /> : <MainTabs />}
    </NavigationContainer>
  );
}
