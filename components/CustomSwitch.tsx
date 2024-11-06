import { ActivityIndicator, TouchableWithoutFeedback } from "react-native";
import React, { useState, useEffect } from "react";
import Animated, {
  interpolateColor,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useDerivedValue,
  withSequence,
  Easing,
  withRepeat,
} from "react-native-reanimated";
import { cn } from "@/lib/MergeClasses";

interface SwitchProps {
  active: boolean;
  disabled?: boolean;
  // onValueChange: () => void;
  onValueChange: any;
  activeColor: string;
  inActiveColor: string;
  switchClassNames?: string;
  trackClassNames?: string;
}

export default function CustomSwitch({
  active,
  disabled,
  onValueChange,
  activeColor,
  inActiveColor,
  trackClassNames,
  switchClassNames,
}: SwitchProps) {
  const [loading, setLoading] = useState(false);

  // value for Switch Animation
  const switchTranslate = useSharedValue(0);

  // Progress Value
  const progress = useDerivedValue(() => {
    return withTiming(active ? 22 : 0);
  });

  // useEffect for change the switchTranslate Value
  useEffect(() => {
    if (active) {
      switchTranslate.value = 26;
    } else {
      switchTranslate.value = 2;
    }
  }, [active, switchTranslate]);

  // Circle Animation
  const customSpringStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(switchTranslate.value, {
            mass: 1,
            damping: 15,
            stiffness: 120,
            overshootClamping: false,
            restSpeedThreshold: 0.001,
            restDisplacementThreshold: 0.001,
          }),
        },
      ],
    };
  });

  // Background Color Animation
  const backgroundColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 22],
      [inActiveColor, activeColor]
    );
    return {
      backgroundColor,
    };
  });

  return (
    <TouchableWithoutFeedback
      onPress={async () => {
        setLoading(true);
        await onValueChange(!active);
        setLoading(false);
        // setActive(!active);
      }}
      disabled={loading || disabled}
    >
      <Animated.View
        style={backgroundColorStyle}
        className={cn("w-14 h-7 rounded-full justify-center", trackClassNames)}
      >
        <Animated.View
          style={customSpringStyles}
          className={cn(
            "flex justify-center items-center p-2 w-6 h-6 rounded-full bg-white",
            switchClassNames
          )}
        >
          {loading ? <ActivityIndicator size='small' color='#000' /> : null}
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
