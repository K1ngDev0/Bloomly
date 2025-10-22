import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");
const LEAF_COUNT = 10;
const leafColors = ["#6a8152", "#7f945f", "#a2b475", "#8aa55d"];

const random = (min: number, max: number) => Math.random() * (max - min) + min;

export default function FallingLeaves() {
  const leaves = useRef(
    Array.from({ length: LEAF_COUNT }).map(() => ({
      translateY: new Animated.Value(random(-200, -50)),
      translateX: new Animated.Value(random(0, width)),
      rotate: new Animated.Value(random(-20, 20)),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(random(0.8, 1.3)),
    }))
  ).current;

  useEffect(() => {
    leaves.forEach((leaf, i) => {
      const animateLeaf = () => {
        const startX = random(0, width);
        const endX = startX + random(-80, 80);
        const duration = random(8000, 12000);

        // Reset position each time
        leaf.translateY.setValue(random(-200, -50));
        leaf.translateX.setValue(startX);
        leaf.opacity.setValue(0);

        Animated.parallel([
          Animated.timing(leaf.opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(leaf.translateY, {
            toValue: height + 50,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(leaf.translateX, {
            toValue: endX,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(leaf.rotate, {
            toValue: random(-60, 60),
            duration,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Restart after a small random delay
          setTimeout(animateLeaf, random(400, 1200));
        });
      };

      // staggered start
      setTimeout(animateLeaf, i * 600);
    });
  }, [leaves]);

  return (
    <View style={styles.container} pointerEvents="none">
      {leaves.map((leaf, i) => {
        const style = {
          transform: [
            { translateX: leaf.translateX },
            { translateY: leaf.translateY },
            {
              rotate: leaf.rotate.interpolate({
                inputRange: [-360, 360],
                outputRange: ["-360deg", "360deg"],
              }),
            },
            { scale: leaf.scale },
          ],
          opacity: leaf.opacity,
        };

        const w = 10 + (i % 3) * 4 + Math.random() * 3;
        const h = 6 + Math.random() * 2;

        return (
          <Animated.View
            key={i}
            style={[
              styles.leaf,
              style,
              {
                width: w,
                height: h,
                borderRadius: Math.max(w, h),
                backgroundColor: leafColors[i % leafColors.length],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    zIndex: 0,
  },
  leaf: {
    position: "absolute",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});
