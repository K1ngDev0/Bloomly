import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StyledButton from "../../components/StyledButton";
import StyledText from "../../components/StyledText";
import { Colors } from "../../constants/Colors";

const STORAGE_STATS = "@bloomly_stats";


export default function Result() {
  const [mainFlower, setMainFlower] = useState<any>(require('../../assets/images/showcaseFlower.png'));
  const [dominantTrait, setDominantTrait] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const firstFade = useRef(new Animated.Value(0)).current;
  const secondScale = useRef(new Animated.Value(0)).current;
  const secondOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // load saved stats and select flower
    let mounted = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_STATS);
        if (!raw) return;
        const stats = JSON.parse(raw || "{}") as Record<string, number>;

        // choose dominant trait among the five tracked traits
        const candidates = ['energy', 'creativity', 'calmness', 'kindness', 'discipline'];
        let dominant = candidates[0];
        let maxVal = -Infinity;
        candidates.forEach(t => {
          const v = Number(stats[t]) || -Infinity;
          if (v > maxVal) {
            maxVal = v;
            dominant = t;
          }
        });

        // mapping trait -> flower image
        const FLOWER_MAP: Record<string,  any> = {
          energy: require('../../assets/images/sunflower.png'),
          creativity: require('../../assets/images/orchid.png'),
          calmness: require('../../assets/images/lavender.png'),
          kindness: require('../../assets/images/red-rose.png'),
          discipline: require('../../assets/images/vine.png'),
        };

        const FLOWER_MAP_EXPLANATION : Record<string, string> = {
          energy: "Sunflower — your vibrant energy and zest for life.",
          creativity: "Orchid — your unique creativity and imagination.",
          calmness: "Lavender — your serene and calming presence.",
          kindness: "Red Rose — your warmth and compassion.",
          discipline: "Vine — your steady discipline and growth.",
        };

        // if the dominant score is reasonably above baseline use it, else fallback
        const USE_THRESHOLD = 45; // tweak: require > threshold to personalize
        const chosen = maxVal > USE_THRESHOLD ? (FLOWER_MAP[dominant] ?? FLOWER_MAP.default) : FLOWER_MAP.default;
        if (mounted) {
          setMainFlower(chosen);
          setDominantTrait(dominant);
          setExplanation(FLOWER_MAP_EXPLANATION[dominant] ?? null);
        }
      } catch (e) {
        console.warn("Result: failed to load stats", e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // fade the first image in
    Animated.timing(firstFade, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      // then run a reveal: pulse + pop-in second image
      Animated.parallel([
        Animated.timing(secondOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(secondScale, {
            toValue: 1.15,
            friction: 6,
            tension: 200,
            useNativeDriver: true,
          }),
          Animated.spring(secondScale, {
            toValue: 1,
            friction: 8,
            tension: 120,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]),
      ]).start();
    });
  }, [firstFade, secondScale, secondOpacity, pulse]);

  const handlePress = () => {
    console.log("Button pressed");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {/* translucent dim layer */}
        <View pointerEvents="none" style={styles.dim} />

        <View style={styles.content}>

          <StyledText style={styles.title} title={true}>Your Bloomy Flower is...</StyledText>

          {/* container for the main "thing" so layering is stable */}
          <View style={styles.centerContainer}>
            {/* main (custom) flower - fades in */}
            <Animated.Image
              source={require('../../assets/images/showcaseFlower.png')}
              style={[
                styles.thingImage,
                { opacity: firstFade },
              ]}
              resizeMode="contain"
            />

            {/* expanding pulse reveal centered over first image */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulse,
                {
                  transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.1, 1.8] }) }],
                  opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.0, 0.6] }),
                },
              ]}
            />

            <Animated.View
              style={[
                styles.overlayCenter,
                {
                  opacity: secondOpacity,
                  transform: [{ scale: secondScale.interpolate({ inputRange: [0, 1.2], outputRange: [0, 1.2] }) }],
                },
              ]}
            >
              <Animated.Image
                source={mainFlower}
                style={styles.thingImage2}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {explanation ? (
            <Animated.View style={{ opacity: secondOpacity, marginTop: 16 }}>
              <StyledText style={styles.explanationTitle} title={true}>
                {explanation.split(' — ')[0] ?? explanation}
              </StyledText>
              <StyledText style={styles.explanationBody}>
                {explanation.split(' — ')[1] ?? ''}
              </StyledText>

              <StyledButton onPress={handlePress} style={{ marginTop: 32, backgroundColor: Colors.button }}>
                Start with your garden
              </StyledButton>

            </Animated.View>
          ) : null}

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
    backgroundColor: 'black', // ensure literal black background
  },
  title: {
    color: '#fff',
  },
  dim: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)', // translucent, not opaque
    zIndex: 1,
  },
  content: {
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  // big image container so we can absolutely center overlays
  centerContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 64,
  },

  thingImage: {
    width: 260,
    height: 260,
    zIndex: 2,
  },

  // pulse circle uses full container size
  pulse: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 2,
  },

  overlayCenter: {
    position: 'absolute',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },

  thingImage2: {
    width: 120,
    height: 120,
  },

  explanation: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 320,
    zIndex: 5,
    fontSize: 14,
  },
  explanationTitle: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 320,
    zIndex: 5,
    fontSize: 32,
    fontWeight: 'bold',
  },
  explanationBody: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: "80%",
    zIndex: 5,
    fontSize: 24,
  },
});