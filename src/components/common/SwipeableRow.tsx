import React, { useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { colors, typography, spacing, borderRadius } from '@/theme';

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  leftLabel?: string;
  leftColor?: string;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onSwipeLeft,
  leftLabel = 'Remove',
  leftColor = colors.error,
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webRow}>
        <View style={styles.webChildren}>{children}</View>
        {onSwipeLeft && (
          <Pressable
            onPress={onSwipeLeft}
            accessibilityLabel={leftLabel}
            style={({ pressed }) => [
              styles.webRejectBtn,
              { backgroundColor: leftColor },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.webRejectBtnText}>✕</Text>
          </Pressable>
        )}
      </View>
    );
  }

  const renderRightActions = () => {
    return (
      <View style={[styles.rightAction, { backgroundColor: leftColor }]}>
        <Text style={styles.actionText}>{leftLabel}</Text>
      </View>
    );
  };

  const handleSwipeableOpen = (direction: 'left' | 'right') => {
    if (direction === 'right' && onSwipeLeft) {
      swipeableRef.current?.close();
      setTimeout(() => onSwipeLeft(), 200);
    }
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeableOpen}
      rightThreshold={80}
      overshootRight={false}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  actionText: {
    ...typography.button,
    color: colors.white,
    paddingHorizontal: spacing.lg,
  },
  webRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  webChildren: {
    flex: 1,
  },
  webRejectBtn: {
    width: 36,
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webRejectBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SwipeableRow;
