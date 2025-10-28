import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar, View } from "react-native";
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Colors } from '../constants/Colors';

export default function RootLayout() {

  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
  }, []);

  return (
    // revert to Colors.background so only result page is black
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar hidden={true} translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(new)" />
      </Stack>
    </View>
  );
}