// src/components/Toast.tsx
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export const Toast = ({
  message,
  isVisible,
}: ToastProps): React.ReactElement => {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(100);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSequence(
        withTiming(insets.bottom > 0 ? -insets.bottom : -20, { duration: 300 }),
        withTiming(insets.bottom > 0 ? -insets.bottom - 10 : -30, {
          duration: 2000,
        }),
        withTiming(100, { duration: 300 }),
      );
    } else {
      opacity.value = 0;
      translateY.value = 100;
    }
  }, [isVisible, insets.bottom, opacity, translateY]);

  if (!isVisible) {
    return <></>;
  }

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute bottom-0 self-center bg-primary py-3 px-6 rounded-full shadow-lg"
    >
      <Text className="text-onPrimary font-bold">{message}</Text>
    </Animated.View>
  );
};
