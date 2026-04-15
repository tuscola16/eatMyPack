import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';

interface BadgeProps {
  label: string;
  color: string;
  textColor?: string;
  variant?: 'filled' | 'outline';
  size?: 'default' | 'small';
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  textColor,
  variant = 'filled',
  size = 'default',
  style,
}) => {
  const isFilled = variant === 'filled';
  const isSmall = size === 'small';
  const resolvedTextColor = textColor ?? (isFilled ? colors.white : color);

  return (
    <View
      style={[
        styles.container,
        isSmall && styles.containerSmall,
        isFilled
          ? { backgroundColor: color }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: color },
        style,
      ]}
    >
      <Text
        style={[
          isSmall ? styles.labelSmall : styles.label,
          { color: resolvedTextColor },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  label: {
    ...typography.small,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
});

export default Badge;
