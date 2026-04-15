import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { colors } from '@/theme';
import { usePackBuilder } from '@/hooks/usePackBuilder';
import { HeroSetup } from '@/components/illustrations';
import RaceForm from '@/components/race/RaceForm';
import type { RaceConfig, SetupMode } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_WIDTH * (200 / 390);

export default function RaceSetupScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { generatePack } = usePackBuilder();

  const setupMode = (mode === 'witch' ? 'witch' : 'wizard') as SetupMode;

  const handleSubmit = (config: RaceConfig) => {
    generatePack(config);
    router.push('/race/plan');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: setupMode === 'witch' ? 'Manual Setup' : 'Plan Your Race',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <View style={styles.heroContainer}>
        <HeroSetup width={SCREEN_WIDTH} height={HERO_HEIGHT} />
      </View>
      <RaceForm onSubmit={handleSubmit} mode={setupMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
});
