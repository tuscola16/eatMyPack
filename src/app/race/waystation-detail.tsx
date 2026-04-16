import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { useStore } from '@/store/useStore';
import { FOODS } from '@/data/foods';
import type { Waystation } from '@/types/race';

const WS_TYPE_COLORS: Record<string, string> = {
  aid_station: '#8EA778',
  pack_refill: '#BE5C35',
  both: '#C4923A',
};

const WS_TYPE_LABELS: Record<string, string> = {
  aid_station: 'Aid Station',
  pack_refill: 'Pack Refill',
  both: 'Aid + Refill',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function WaystationDetailScreen() {
  const router = useRouter();
  const { wsId, planId } = useLocalSearchParams<{ wsId: string; planId?: string }>();

  const savedPlans = useStore((s) => s.savedPlans);
  const currentPlan = useStore((s) => s.currentPlan);

  const plan = planId
    ? savedPlans.find((p) => p.id === planId) ?? null
    : currentPlan;

  const waystation: Waystation | undefined = plan?.race_config?.waystations?.find(
    (ws) => ws.id === wsId,
  );

  if (!waystation) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorState}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ Back</Text>
          </Pressable>
          <Text style={styles.errorText}>Waystation not found.</Text>
        </View>
      </View>
    );
  }

  const typeColor = WS_TYPE_COLORS[waystation.type] ?? colors.primary;
  const typeLabel = WS_TYPE_LABELS[waystation.type] ?? waystation.type;
  const hour = waystation.estimated_hour ?? waystation.marker_value;

  const packedFoods =
    waystation.foods && waystation.foods.length > 0
      ? waystation.foods.map((id) => FOODS.find((f) => f.id === id)).filter(Boolean)
      : [];

  const foodCalories = packedFoods.reduce((sum, f) => sum + (f?.calories ?? 0), 0);
  const totalCalories =
    waystation.calories_consumed != null
      ? waystation.calories_consumed
      : foodCalories > 0
        ? foodCalories
        : null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header bar */}
        <View style={[styles.headerBar, { borderLeftColor: typeColor }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ Back</Text>
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={[styles.typeLabel, { color: typeColor }]}>{typeLabel}</Text>
            <Text style={styles.timeLabel}>
              {waystation.marker_type === 'mile'
                ? `Mile ${waystation.marker_value}${hour != null ? ` (~${hour}h)` : ''}`
                : `Hour ${hour}`}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Key stats */}
          <View style={styles.card}>
            <InfoRow label="Type" value={typeLabel} />
            <InfoRow
              label="Position"
              value={
                waystation.marker_type === 'mile'
                  ? `Mile ${waystation.marker_value}`
                  : `Hour ${waystation.marker_value}`
              }
            />
            {waystation.estimated_hour != null && waystation.marker_type === 'mile' && (
              <InfoRow label="Estimated Time" value={`~${waystation.estimated_hour}h`} />
            )}
            {totalCalories != null && (
              <InfoRow label="Calories Consumed" value={`${totalCalories} kcal`} />
            )}
            {waystation.pack_volume_ml != null && (
              <InfoRow
                label="Pack Volume"
                value={`${(waystation.pack_volume_ml / 1000).toFixed(1)} L`}
              />
            )}
          </View>

          {/* Notes */}
          {waystation.notes ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{waystation.notes}</Text>
            </View>
          ) : null}

          {/* Packed foods */}
          {packedFoods.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Packed Foods</Text>
              {packedFoods.map((food) =>
                food ? (
                  <Pressable
                    key={food.id}
                    style={styles.foodRow}
                    onPress={() =>
                      router.push({ pathname: '/database/[id]', params: { id: food.id } })
                    }
                  >
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodBrand}>{food.brand}</Text>
                    </View>
                    <Text style={styles.foodCals}>{food.calories} cal</Text>
                  </Pressable>
                ) : null,
              )}
              {packedFoods.length > 0 && (
                <View style={styles.foodTotalRow}>
                  <Text style={styles.foodTotalLabel}>Total</Text>
                  <Text style={styles.foodTotalValue}>{foodCalories} cal</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  backBtn: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  typeLabel: {
    ...typography.h3,
  },
  timeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  notesText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  foodBrand: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  foodCals: {
    ...typography.captionBold,
    color: colors.calories,
  },
  foodTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  foodTotalLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  foodTotalValue: {
    ...typography.captionBold,
    color: colors.calories,
  },
  errorState: {
    flex: 1,
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
