import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '@/theme';
import OnboardingRunner from '@/components/illustrations/OnboardingRunner';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ONBOARDING_KEY = 'hasSeenOnboarding_v1';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  // Animation values
  const imageOpacity  = useSharedValue(0);
  const titleOpacity  = useSharedValue(0);
  const titleY        = useSharedValue(20);
  const bodyOpacity   = useSharedValue(0);
  const bodyY         = useSharedValue(16);
  const buttonOpacity = useSharedValue(0);
  const buttonScale   = useSharedValue(0.92);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    imageOpacity.value  = withTiming(1, { duration: 500, easing: ease });
    titleOpacity.value  = withDelay(300, withTiming(1, { duration: 400, easing: ease }));
    titleY.value        = withDelay(300, withTiming(0, { duration: 400, easing: ease }));
    bodyOpacity.value   = withDelay(500, withTiming(1, { duration: 400, easing: ease }));
    bodyY.value         = withDelay(500, withTiming(0, { duration: 400, easing: ease }));
    buttonOpacity.value = withDelay(700, withTiming(1, { duration: 300, easing: ease }));
    buttonScale.value   = withDelay(700, withSpring(1, { damping: 14, stiffness: 120 }));
  }, []);

  const imageStyle  = useAnimatedStyle(() => ({ opacity: imageOpacity.value }));
  const titleStyle  = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const bodyStyle   = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
    transform: [{ translateY: bodyY.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Full-bleed illustration */}
      <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
        <OnboardingRunner width={SCREEN_WIDTH} height={SCREEN_HEIGHT} />
      </Animated.View>

      {/* Bottom content panel */}
      <View style={[styles.panel, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Animated.Text style={[styles.title, titleStyle]}>
          Fuel the run.{'\n'}Every mile.
        </Animated.Text>

        <Animated.Text style={[styles.body, bodyStyle]}>
          Build a custom nutrition pack for your next ultra — calories, carbs,
          and sodium dialed in by phase, so you never bonk.
        </Animated.Text>

        <Animated.View style={buttonStyle}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGetStarted}
          >
            <Text style={styles.buttonText}>Let's go →</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    // Gradient-style scrim via background
    backgroundColor: 'rgba(245, 240, 232, 0.92)',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    ...typography.button,
    color: colors.textInverse,
    fontSize: 17,
  },
});
