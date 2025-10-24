import { Image, Keyboard, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const image = require('../assets/images/blankBaackground.png');

export default function Index() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <Image source={image} style={styles.backgroundImage} resizeMode="cover" />

        
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
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    zIndex: -1,
  },
 
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 100,
    zIndex: 1,
  },
  centerImage: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    width: 200,
    height: 200,
    marginTop: -40,
  },
  overlay: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    width: "80%",
    alignSelf: "center",
  }
});