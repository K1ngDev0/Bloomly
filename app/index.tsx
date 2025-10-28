import { Asset } from "expo-asset";
import { router } from "expo-router";
import { Image, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spacer } from "../components/Spacers";
import StyledButton from "../components/StyledButton";
import StyledText from "../components/StyledText";
import { Colors } from "../constants/Colors";

const image = require('../assets/images/BloomlyBackgroundV1.png');

const preloadFormAssets = async () => {
	// list all images used by the form screen so they are cached before navigation
	const assets = [
		require('../assets/images/blankBackground.png'),
		require('../assets/images/sunflower.png'),
		require('../assets/images/lavender.png'),
		require('../assets/images/china.png'),
		require('../assets/images/flower.png'),
		require('../assets/images/orchid.png'),
		require('../assets/images/vine.png'),
		require('../assets/images/english-ivy.png'),
		require('../assets/images/red-rose.png'),
	];
	try {
		await Promise.all(assets.map(a => Asset.loadAsync(a)));
	} catch (e) {
		// fail silently — still navigate if preload fails
		console.warn('Failed to preload form assets', e);
	}
};

export default function Index() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <Image source={image} style={styles.backgroundImage} resizeMode="cover" />

        <View pointerEvents="none" style={styles.centerImage}>
          <Image
            source={require('../assets/images/BloomlySproutScreen.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <View style={styles.overlay}>
            <Image source={require('../assets/images/BloomlySprout.png')} style={{ width: 100, height: 100 }} />
            <StyledText title={true}>Bloomly</StyledText>
            <StyledText>Welcome, little sprout!</StyledText>
          </View>
          <View style={styles.buttonContainer}>
            <StyledButton
              onPress={async () => {
                await preloadFormAssets();
                router.replace('/loadingData');
              }}
              style={{ backgroundColor: Colors.button ?? '#fff' }}
              textStyle={{ color: Colors.primary }}
            >
              Continue
            </StyledButton>
            <Spacer size={8} />
            <StyledButton
              onPress={async () => {
                await preloadFormAssets();
                router.replace('/form');
              }}
              textStyle={{ color: Colors.button }}
            >
              New Garden
            </StyledButton>
          </View>
        </View>
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