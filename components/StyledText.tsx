import { StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/Colors';

export default function StyledText({ style, title = false, children, ...props }: any) {
  return (
    <Text style={[title ? styles.title : styles.text, { color: title ? Colors.title : Colors.text }, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "400",
  },
})