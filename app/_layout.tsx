import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar, View } from "react-native";
import 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function RootLayout() {

  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar hidden={true} translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          // Ensure there's no white flash between screen mounts
          contentStyle: { backgroundColor: 'black' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(new)" />
      </Stack>
    </View>
  );
}