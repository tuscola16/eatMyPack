import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { useStore } from '@/store/useStore';
import PlanCard from '@/components/race/PlanCard';
import EmptyState from '@/components/common/EmptyState';
import { confirmDestructive } from '@/utils/confirm';

export default function PlansListScreen() {
  const router = useRouter();
  const savedPlans = useStore((s) => s.savedPlans);
  const deletePlan = useStore((s) => s.deletePlan);

  const handleDelete = (id: string) => {
    confirmDestructive({
      title: 'Delete Plan',
      message: 'Are you sure you want to delete this plan?',
      confirmLabel: 'Delete',
      onConfirm: () => deletePlan(id),
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Saved Plans</Text>
        <View style={styles.headerBtn} />
      </View>
      <FlatList
        data={savedPlans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PlanCard
            plan={item}
            onPress={() => router.push({ pathname: '/race/plan', params: { id: item.id, source: 'plans' } })}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No saved plans"
            subtitle="Create a plan from the home screen to get started."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerBtn: {
    minWidth: 56,
    paddingVertical: spacing.xs,
  },
  headerBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
