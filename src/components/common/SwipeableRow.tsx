import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { colors, typography, spacing } from '@/theme';

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

  const renderRightActions = () => {
    return (
      <View style={[styles.rightAction, { backgroundColor: leftColor }]}>
        <Text style={styles.actionText}>{leftLabel}</Text>
      </View>
    );
  };

  const handleSwipeableOpen = (direction: 'left' | 'right') => {
    if (direction === 'right' && onSwipeLeft) {
      onSwipeLeft();
      swipeableRef.current?.close();
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
});

export default SwipeableRow;
