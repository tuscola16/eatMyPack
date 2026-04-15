import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  /** Scale on press. Default 0.97 */
  pressScale?: number;
  children: React.ReactNode;
}

const DURATION = 100;
const EASE = Easing.inOut(Easing.ease);

/**
 * Drop-in Pressable replacement with a smooth spring-scale press effect.
 * Uses Reanimated withTiming for a 100ms ease-in-out feel per the design spec.
 */
export default function AnimatedPressable({
  style,
  pressedStyle,
  pressScale = 0.97,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, style as ViewStyle]}>
      <Pressable
        {...rest}
        style={({ pressed }) => [
          { flex: 1 },
          pressed && pressedStyle,
        ]}
        onPressIn={(e) => {
          scale.value = withTiming(pressScale, { duration: DURATION, easing: EASE });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withTiming(1, { duration: DURATION, easing: EASE });
          onPressOut?.(e);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
