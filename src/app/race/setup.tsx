import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { colors } from '@/theme';
import { usePackBuilder } from '@/hooks/usePackBuilder';
import { useStore } from '@/store/useStore';
import { HeroSetup } from '@/components/illustrations';
import RaceForm from '@/components/race/RaceForm';
import type { RaceConfig, SetupMode } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_WIDTH * (200 / 390);

export default function RaceSetupScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { generatePack } = usePackBuilder();
  const savePlan = useStore((s) => s.savePlan);

  const setupMode = (mode === 'complex' || mode === 'witch' ? 'complex' : 'simple') as SetupMode;

  const handleSubmit = (config: RaceConfig, name: string) => {
    const plan = generatePack(config, name);
    savePlan(plan);
    router.push({ pathname: '/race/plan', params: { id: plan.id } });
  };

  const heroElement = (
    <View style={styles.heroContainer}>
      <HeroSetup width={SCREEN_WIDTH} height={HERO_HEIGHT} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <RaceForm
        onSubmit={handleSubmit}
        mode={setupMode}
        heroComponent={heroElement}
      />
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
    alignItems: 'center',
  },
});
