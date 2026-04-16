import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { useStore } from '@/store/useStore';
import EmptyState from '@/components/common/EmptyState';
import type { PackPhase } from '@/types/plan';

interface AggregatedItem {
  name: string;
  brand: string;
  quantity: number;
}

function aggregateEntries(phases: PackPhase[]): AggregatedItem[] {
  const map = new Map<string, AggregatedItem>();
  for (const phase of phases) {
    for (const entry of phase.entries) {
      const key = entry.food.id;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += entry.servings;
      } else {
        map.set(key, {
          name: entry.food.name,
          brand: entry.food.brand,
          quantity: entry.servings,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function splitIntoSegments(phases: PackPhase[]): PackPhase[][] {
  const segments: PackPhase[][] = [];
  let current: PackPhase[] = [];

  for (const phase of phases) {
    current.push(phase);
    if (phase.phase.is_pack_refill) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    segments.push(current);
  }
  return segments;
}

export default function PackingListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const savedPlans = useStore((s) => s.savedPlans);
  const plan = savedPlans.find((p) => p.id === id) ?? null;

  if (!plan) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Packing List',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textPrimary,
            headerShadowVisible: false,
          }}
        />
        <EmptyState
          title="Plan not found"
          subtitle="This plan may have been deleted."
        />
      </View>
    );
  }

  const segments = splitIntoSegments(plan.phases);
  const hasMultipleSegments = segments.length > 1;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Packing List',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.planName}>{plan.name || plan.race_config.distance}</Text>

        {hasMultipleSegments ? (
          segments.map((segment, segIndex) => {
            const items = aggregateEntries(segment);
            const startHour = segment[0]?.phase.start_hour ?? 0;
            const endHour = segment[segment.length - 1]?.phase.end_hour ?? 0;
            const isLast = segIndex === segments.length - 1;

            return (
              <View key={segIndex} style={styles.segmentCard}>
                <Text style={styles.segmentTitle}>
                  {isLast
                    ? `Pack Segment ${segIndex + 1} (${startHour}–${endHour}h)`
                    : `Pack Segment ${segIndex + 1} (${startHour}–${endHour}h, refill at ${endHour}h)`}
                </Text>
                {items.map((item, i) => (
                  <View key={i} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemBrand}>{item.brand}</Text>
                    </View>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                  </View>
                ))}
              </View>
            );
          })
        ) : (
          <View style={styles.segmentCard}>
            <Text style={styles.segmentTitle}>All Items</Text>
            {aggregateEntries(plan.phases).map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemBrand}>{item.brand}</Text>
                </View>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
              </View>
            ))}
          </View>
        )}
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  planName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  segmentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  segmentTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  itemBrand: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  itemQty: {
    ...typography.bodyBold,
    color: colors.primary,
    minWidth: 30,
    textAlign: 'right',
  },
});
