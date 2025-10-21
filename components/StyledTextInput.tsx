import { StyleSheet, TextInput, TextInputProps } from "react-native";

const StyledTextInput = ({ style, ...props }: TextInputProps) => {
    return <TextInput style={[styles.input, style]} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
  },
});

export default StyledTextInput;