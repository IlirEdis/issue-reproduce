import { View, Text, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { ActivityIndicator } from "react-native";

export default function RecipeCard({
  title,
  id,
  imageUrl,
}: {
  title: string;
  id: number;
  imageUrl: string;
}) {
  return (
    <Pressable onPress={() => router.push(`/recipes/${id.toString()}`)}>
      <View className='flex-col gap-2 '>
        <View className='justify-center items-center w-full h-40 bg-gray-400 rounded-md overflow-hidden'>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className='w-full h-40 rounded-md'
            />
          ) : (
            <ActivityIndicator />
          )}
        </View>
        <Text className='text-lg font-semibold'>{title}</Text>
      </View>
    </Pressable>
  );
}
