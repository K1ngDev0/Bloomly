import { Text } from 'react-native';
import { Colors } from '../constants/Colors';

export default function StyledText({ style, title = false, children, ...props }: any) {
  return (
    <Text style={[{ color: title ? Colors.title : Colors.text }, style]} {...props}>
      {children}
    </Text>
  );
}