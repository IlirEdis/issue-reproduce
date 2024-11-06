import { cn } from "@/utils/MergeClasses";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

export default function CustomButton({
  title,
  containerClassName,
  contentClassName,
  textClassName,
  disabled,
  children,
  ...props
}: CustomButtonProps & TouchableOpacityProps) {
  return (
    <TouchableOpacity
      className={cn(
        `relative bg-accent w-fit h-fit rounded-md py-3 px-6 justify-center items-center ${
          disabled && "opacity-50"
        }`,
        containerClassName
      )}
      disabled={disabled}
      {...props}
    >
      <View className={cn("flex-row items-center gap-2", contentClassName)}>
        {/* <Text className={cn("relative uppercase", textClassName)}>{title}</Text> */}
        {children}
      </View>
    </TouchableOpacity>
  );
}
