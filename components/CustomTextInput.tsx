import React from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  TextInputProps,
  View,
} from "react-native";

interface Props extends TextInputProps {
  errorMessage?: string;
  label?: string;
}

export const TextInput: React.FC<Props> = ({
  errorMessage,
  label,
  ...textInputProps
}) => {
  return (
    <View className='w-full'>
      {label ? <Text className='mb-4'>{label}</Text> : null}
      <RNTextInput
        className='h-12 border-border border px-3 py-2 bg-white rounded-md'
        autoCorrect={false}
        autoCapitalize='none'
        {...textInputProps}
      />
      {!!errorMessage && (
        <Text className='text-error font-semibold mt-4'>{errorMessage}</Text>
      )}
    </View>
  );
};
