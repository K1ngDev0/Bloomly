import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/Colors';

export default function StyledButton({ title, children, style, textStyle, onPress, ...props }: any) {
  const [hovered, setHovered] = useState(false);
  const btnTitle = title ?? (typeof children === 'string' ? children : '');

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
      style={({ pressed }) => [
        styles.button,
        hovered && styles.hover,
        pressed && styles.pressed,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, textStyle]}>{String(btnTitle)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '80%',
    height: 54,
  },
  hover: {
    opacity: 0.95,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});