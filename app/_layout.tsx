import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function RootLayout() {

  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
  }, []);

  return (
    <>
      <StatusBar hidden={true} translucent backgroundColor="transparent" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="(new)" options={{ headerShown: false, animation: 'none' }} />
      </Stack>
    </>
  );
}