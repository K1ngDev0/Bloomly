import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Button, Easing, Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from "react-native";
import { Colors } from "../constants/Colors";
import StyledButton from "./StyledButton";
import StyledText from "./StyledText";

export type Question = {
    id: string;
    prompt: string;
    image?: any;
    options?: string[];
    effects?: { [option: string]: { [stat: string]: number } };
}

export type Answer = {
    id: string;
    answer: string;
    questionId: string;
}

export type QuestionTemplateProps = {
    question: Question;
    onAnswer: (answer: string) => void;
}

const QuestionTemplate: React.FC<QuestionTemplateProps> = ({ question, onAnswer }) => {
  const [answer, setAnswer] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const animValsRef = useRef<Animated.Value[]>([]);

  const opts = question.options ?? [];
  if (animValsRef.current.length !== opts.length) {
    animValsRef.current = opts.map(() => new Animated.Value(0));
  }

  const playedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    setSelected(null);

    if (animValsRef.current.length === 0) return;
    animValsRef.current.forEach(v => v.setValue(0));

    if (opts.length === 0) return;

    if (playedRef.current[question.id]) {
      animValsRef.current.forEach(v => v.setValue(1));
      return;
    }

    const animations = animValsRef.current.map(v =>
      Animated.timing(v, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start(() => {
      playedRef.current[question.id] = true;
    });
  }, [question.id]);
  
  const submit = useCallback(() => {
    const trimmed = answer.trim();
    if (!trimmed) return;
    onAnswer(trimmed);
    setAnswer('');
  }, [answer, onAnswer]);

  const canSubmit = answer.trim().length > 0;

  const canProceed = Boolean(selected) || canSubmit;

  const handleNext = () => {
    const value = selected ?? answer.trim();
    if (!value) return;

    onAnswer(value);

    setSelected(null);
    setAnswer('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container} // changed to full-height container
    >
      <View style={styles.content}>
        {/* Header: image + prompt */}
        <View style={styles.header}>
          {!!question.image ? (
            <Image source={question.image} style={styles.image} resizeMode="contain" />
          ) : (
            // reserve same space if there's no image so layout doesn't shift
            <View style={styles.imagePlaceholder} />
          )}

          <StyledText title={true} style={styles.promptText}>
            {question.prompt}
          </StyledText>
        </View>

        {/* Body: options or text input */}
        <View style={styles.body}>
          {Array.isArray(question.options) && question.options.length > 0 ? (
            <View style={styles.options}>
              {question.options.map((opt, i) => {
                const anim = animValsRef.current[i];
                const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] });
                const opacity = anim;
                return (
                  <Animated.View
                    key={i}
                    style={{
                      opacity,
                      transform: [{ translateY }],
                      width: '100%',
                      marginBottom: 8,
                    }}
                  >
                    <StyledButton
                      onPress={() => setSelected(prev => (prev === opt ? null : opt))}
                      style={{
                        backgroundColor: selected === opt ? Colors.button : Colors.primary,
                        width: '100%',
                      }}
                      textStyle={selected === opt ? { color: '#fff', fontWeight: '700' } : undefined}
                    >
                      {opt}
                    </StyledButton>
                  </Animated.View>
                );
              })}
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Type your answer..."
                value={answer}
                onChangeText={setAnswer}
                returnKeyType="send"
                onSubmitEditing={submit}
              />

              <Button title="Submit" onPress={submit} disabled={!canSubmit} />
            </>
          )}
        </View>

        {/* Footer: Next button anchored at bottom */}
        <View style={styles.footer}>
          <StyledButton
            onPress={handleNext}
            style={{
              backgroundColor: Colors.button,
              width: '60%',
              opacity: canProceed ? 1 : 0.5,
            }}
          >
            Next
          </StyledButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default QuestionTemplate;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1, // fill vertical space so header/body/footer layout is stable
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between', // keep footer at bottom
  },
  header: {
    // increased and fixed minimum space for image + prompt so options/footer don't jump
    minHeight: 180,
    justifyContent: 'center',
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
  },
  promptText: {
    fontSize: 30,
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginTop: 50
  },
  imagePlaceholder: {
    width: '100%',
    height: 140, // same height as image to preserve layout when image is missing
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  body: {
    // reserve space for options / input so footer remains stable
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  options: {
    width: '90%',
    alignSelf: 'center',
    gap: 8,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});