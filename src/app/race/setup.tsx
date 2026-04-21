import React, { useMemo } from 'react';
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
  const { mode, existingPlanId, planName } = useLocalSearchParams<{
    mode?: string;
    existingPlanId?: string;
    planName?: string;
  }>();
  const { generatePack } = usePackBuilder();
  const savePlan = useStore((s) => s.savePlan);
  const savedPlans = useStore((s) => s.savedPlans);
  const clearRejections = useStore((s) => s.clearRejections);
  const rejectFood = useStore((s) => s.rejectFood);

  const existingPlan = useMemo(
    () => (existingPlanId ? savedPlans.find((p) => p.id === existingPlanId) ?? null : null),
    [existingPlanId, savedPlans],
  );

  const setupMode = (mode === 'complex' || mode === 'witch' ? 'complex' : 'simple') as SetupMode;

  const handleSubmit = (
    config: RaceConfig,
    name: string,
    raceDate?: string,
    startTime?: string,
  ) => {
    // Restore per-plan rejections so regenerated pack respects previous user exclusions.
    if (existingPlan?.rejected_food_ids?.length) {
      clearRejections();
      existingPlan.rejected_food_ids.forEach((id) => rejectFood(id));
    } else if (existingPlan) {
      clearRejections();
    }
    const generated = generatePack(config, name);
    const basePlan = existingPlan
      ? { ...generated, id: existingPlan.id, name: name || existingPlan.name }
      : generated;
    const plan = {
      ...basePlan,
      race_date: raceDate ?? existingPlan?.race_date,
      start_time: startTime ?? existingPlan?.start_time,
    };
    savePlan(plan);
    router.replace({ pathname: '/race/plan', params: { id: plan.id } });
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
        initialConfig={existingPlan?.race_config}
        initialPlanName={existingPlan ? (planName ?? existingPlan.name) : undefined}
        initialRaceDate={existingPlan?.race_date}
        initialStartTime={existingPlan?.start_time}
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
