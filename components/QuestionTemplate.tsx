import { useCallback, useState } from "react";
import { Button, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";

export type Question = {
    id: string;
    prompt: string;
    image?: any;
}

export type QuestionTemplateProps = {
    question: Question;
    onAnswer: (answer: string) => void;
}

const QuestionTemplate: React.FC<QuestionTemplateProps> = ({ question, onAnswer }) => {
  const [answer, setAnswer] = useState('');

  const submit = useCallback(() => {
    const trimmed = answer.trim();
    if (!trimmed) return;
    onAnswer(trimmed);
    setAnswer('');
  }, [answer, onAnswer]);

  const canSubmit = answer.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>{question.prompt}</Text>

        {!!question.image && (
          <Image source={question.image} style={styles.image} resizeMode="contain" />
        )}

        <TextInput
          style={styles.input}
          placeholder="Type your answer..."
          value={answer}
          onChangeText={setAnswer}
          returnKeyType="send"
          onSubmitEditing={submit}
          blurOnSubmit
        />

        <Button title="Submit" onPress={submit} disabled={!canSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default QuestionTemplate;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});