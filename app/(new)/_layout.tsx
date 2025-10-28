import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

export default function _layout() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
  }, []);

  return (
    <>
      <StatusBar hidden={true} translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: Colors.background }, }}
      >
      </Stack>
    </>
  );
}