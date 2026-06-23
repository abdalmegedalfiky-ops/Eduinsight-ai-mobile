// src/navigation/TeacherStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TeacherClassesScreen from "../screens/teacher/TeacherClassesScreen";
import ClassDetailScreen from "../screens/teacher/ClassDetailScreen";
import { colors } from "../theme/colors";

export type TeacherStackParamList = {
  ClassesList: undefined;
  ClassDetail: { classId: string; className: string };
};

const Stack = createNativeStackNavigator<TeacherStackParamList>();

export default function TeacherStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="ClassesList" component={TeacherClassesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClassDetail" component={ClassDetailScreen} options={{ title: "" }} />
    </Stack.Navigator>
  );
}
