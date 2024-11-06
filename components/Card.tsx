import { ReactNode } from "react";
import { Text, View } from "react-native";

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Card({ title, description, footer, children }: Props) {
  return (
    <View className='w-full max-w-3xl m-auto my-8 border border-border rounded-md bg-white'>
      <View className='px-5 py-4'>
        <Text className='mb-1 text-2xl font-medium'>{title}</Text>
        <Text>{description}</Text>
        {children}
      </View>
      {footer && <View className='p-4 border-t border-border'>{footer}</View>}
    </View>
  );
}
