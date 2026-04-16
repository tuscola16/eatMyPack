import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { Waystation, WaystationType, MarkerType } from '@/types/race';

interface WaystationEditorProps {
  waystations: Waystation[];
  onChange: (waystations: Waystation[]) => void;
  totalDurationHours: number;
  totalDistanceMiles?: number;
  defaultPackVolumeMl?: number;
}

function generateId(): string {
  return `ws-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

const TYPE_OPTIONS: { value: WaystationType; label: string }[] = [
  { value: 'aid_station', label: 'Aid Station' },
  { value: 'pack_refill', label: 'Pack Refill' },
  { value: 'both', label: 'Both' },
];

const MARKER_OPTIONS: { value: MarkerType; label: string }[] = [
  { value: 'hour', label: 'Hour' },
  { value: 'mile', label: 'Mile' },
];

export default function WaystationEditor({
  waystations,
  onChange,
  totalDurationHours,
  totalDistanceMiles,
  defaultPackVolumeMl,
}: WaystationEditorProps) {
  const addWaystation = () => {
    const ws: Waystation = {
      id: generateId(),
      type: 'aid_station',
      marker_type: 'hour',
      marker_value: 0,
      notes: '',
    };
    onChange([...waystations, ws].sort((a, b) => (a.marker_value || 0) - (b.marker_value || 0)));
  };

  const updateWaystation = (id: string, updates: Partial<Waystation>) => {
    const updated = waystations.map(ws => {
      if (ws.id !== id) return ws;
      const merged = { ...ws, ...updates };
      // Auto-compute estimated_hour for mile markers
      if (merged.marker_type === 'mile' && totalDistanceMiles && totalDistanceMiles > 0) {
        merged.estimated_hour = Math.round((merged.marker_value / totalDistanceMiles) * totalDurationHours * 10) / 10;
      } else if (merged.marker_type === 'hour') {
        merged.estimated_hour = merged.marker_value;
      }
      return merged;
    });
    onChange(updated.sort((a, b) => (a.estimated_hour || a.marker_value || 0) - (b.estimated_hour || b.marker_value || 0)));
  };

  const removeWaystation = (id: string) => {
    onChange(waystations.filter(ws => ws.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Waystations</Text>
      <Text style={styles.sectionSubtitle}>
        Add aid stations and pack refill points along the course
      </Text>

      {waystations.map((ws) => (
        <View key={ws.id} style={styles.card}>
          {/* Type pills */}
          <View style={styles.pillRow}>
            {TYPE_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={[
                  styles.pill,
                  ws.type === opt.value && styles.pillActive,
                ]}
                onPress={() => updateWaystation(ws.id, { type: opt.value })}
              >
                <Text style={[
                  styles.pillText,
                  ws.type === opt.value && styles.pillTextActive,
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Marker type + value */}
          <View style={styles.markerRow}>
            <View style={styles.markerToggle}>
              {MARKER_OPTIONS.map(opt => (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.markerPill,
                    ws.marker_type === opt.value && styles.markerPillActive,
                  ]}
                  onPress={() => updateWaystation(ws.id, { marker_type: opt.value })}
                >
                  <Text style={[
                    styles.markerPillText,
                    ws.marker_type === opt.value && styles.markerPillTextActive,
                  ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.markerInput}
              value={ws.marker_value ? ws.marker_value.toString() : ''}
              onChangeText={(val) => {
                const num = parseFloat(val);
                updateWaystation(ws.id, { marker_value: isNaN(num) ? 0 : num });
              }}
              keyboardType="numeric"
              placeholder={ws.marker_type === 'hour' ? 'Hour' : 'Mile'}
              placeholderTextColor={colors.textMuted}
            />
            {ws.marker_type === 'mile' && ws.estimated_hour != null && (
              <Text style={styles.estimatedHour}>~{ws.estimated_hour}h</Text>
            )}
          </View>

          {/* Pack volume (only for pack_refill or both) */}
          {(ws.type === 'pack_refill' || ws.type === 'both') && (
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Pack volume (L)</Text>
              <TextInput
                style={styles.smallInput}
                value={ws.pack_volume_ml ? (ws.pack_volume_ml / 1000).toString() : ''}
                onChangeText={(val) => {
                  const num = parseFloat(val);
                  updateWaystation(ws.id, {
                    pack_volume_ml: isNaN(num) ? defaultPackVolumeMl : Math.round(num * 1000),
                  });
                }}
                keyboardType="decimal-pad"
                placeholder={defaultPackVolumeMl ? (defaultPackVolumeMl / 1000).toFixed(1) : '3.0'}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          )}

          {/* Calories consumed */}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Calories consumed here</Text>
            <TextInput
              style={styles.smallInput}
              value={ws.calories_consumed ? ws.calories_consumed.toString() : ''}
              onChangeText={(val) => {
                const num = parseInt(val, 10);
                updateWaystation(ws.id, { calories_consumed: isNaN(num) ? undefined : num });
              }}
              keyboardType="numeric"
              placeholder="Optional"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={ws.notes ?? ''}
              onChangeText={(val) => updateWaystation(ws.id, { notes: val })}
              placeholder="Optional notes"
              placeholderTextColor={colors.textMuted}
              multiline
            />
          </View>

          {/* Remove button */}
          <Pressable
            style={styles.removeButton}
            onPress={() => removeWaystation(ws.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </Pressable>
        </View>
      ))}

      <Pressable style={styles.addButton} onPress={addWaystation}>
        <Text style={styles.addButtonText}>+ Add Waystation</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  pillText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  markerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  markerToggle: {
    flexDirection: 'row',
    gap: 2,
  },
  markerPill: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  markerPillActive: {
    backgroundColor: colors.primary,
  },
  markerPillText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  markerPillTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  markerInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
  },
  estimatedHour: {
    ...typography.caption,
    color: colors.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  smallInput: {
    width: 100,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  notesSection: {
    marginBottom: spacing.xs,
  },
  notesInput: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    marginTop: spacing.xs,
  },
  removeButton: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
  },
  removeButtonText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  addButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  addButtonText: {
    ...typography.captionBold,
    color: colors.primary,
  },
});
