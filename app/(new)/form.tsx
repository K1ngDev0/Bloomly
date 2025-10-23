import { useState } from "react";
import { Image, Keyboard, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QuestionTemplate, { Question } from "../../components/QuestionTemplate";
import StyledText from "../../components/StyledText";

const question: Question = {
    id: 'q1',
    prompt: 'What is your favorite color?',
};

const image = require('../../assets/images/blankBackground.png');

export default function Index() {
  const [answer, setAnswer] = useState<string | undefined>(undefined);

  const handleAnswer = (value: string) => {
    setAnswer(value);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <Image source={image} style={styles.backgroundImage} resizeMode="cover" />

        <QuestionTemplate question={question} onAnswer={handleAnswer} />

        {!!answer && (
          <StyledText style={styles.answer}>{answer}</StyledText>
        )}
        
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 0,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    answer: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        textAlign: 'center',
    },
});