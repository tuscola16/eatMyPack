import React from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { colors, spacing } from '@/theme';
import { useStore } from '@/store/useStore';
import PlanCard from '@/components/race/PlanCard';
import EmptyState from '@/components/common/EmptyState';

export default function PlansListScreen() {
  const router = useRouter();
  const savedPlans = useStore((s) => s.savedPlans);
  const deletePlan = useStore((s) => s.deletePlan);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Plan', 'Are you sure you want to delete this plan?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePlan(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Saved Plans',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}
      />
      <FlatList
        data={savedPlans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PlanCard
            plan={item}
            onPress={() => router.push(`/race/plan?id=${item.id}`)}
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
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
