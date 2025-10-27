import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Result() {

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>

        <View
          pointerEvents="none"
          style={{ backgroundColor: 'black', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
        />
        
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
    backgroundColor: 'black',
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