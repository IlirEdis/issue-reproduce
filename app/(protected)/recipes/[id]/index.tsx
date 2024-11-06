import {
  View,
  Text,
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";
import CustomButton from "@/components/CustomButton";
import { Pencil, Trash } from "lucide-react-native";
import GetAuthor from "@/utils/getAuthor";
import { User } from "@supabase/supabase-js";

export default function SingleRecipe() {
  const { id } = useLocalSearchParams();
  const [singleRecipe, setSingleRecipe] = useState<{
    data: Recipe | null;
    user: User | null;
  }>({ data: null, user: null });
  // console.log("recipe", singleRecipe);

  useEffect(() => {
    const fetchRecipe = async () => {
      const { data, error } = await supabase
        .from("Recipes")
        .select()
        .eq("id", id)
        .single();

      if (data) {
        const { user } = await GetAuthor(data.from_user);
        setSingleRecipe({ data, user });
      }
    };

    fetchRecipe();
  }, []);

  if (!singleRecipe.data || !singleRecipe.user) {
    return (
      <View className='items-center justify-center flex-1'>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView>
      {/* <Stack.Screen
        options={{ title: singleRecipe ? singleRecipe.data?.title : "" }}
      /> */}
      <View>
        <View>
          <Image
            source={{ uri: singleRecipe.data?.image_url }}
            className='w-full h-96'
          />
        </View>

        <View className='p-4 flex-row'>
          <CustomButton
            containerClassName='bg-transparent border border-border w-fit rounded-md py-2 px-4'
            onPress={() =>
              router.push(`/recipes/${singleRecipe.data?.id.toString()}/edit`)
            }
          >
            <Pencil width={15} color='gray' />
            <Text>Edit</Text>
          </CustomButton>
        </View>

        <View className='px-4'>
          <View>
            <Text className='text-2xl font-bold py-2'>
              {singleRecipe.data?.title}
            </Text>
            <Text>by: {singleRecipe?.user?.email}</Text>
          </View>
          <Text className='py-4'>{singleRecipe.data?.notes}</Text>
          <Text>{singleRecipe.data?.isPublic ? "Public" : "Private"}</Text>
        </View>

        <View>
          {singleRecipe.data?.steps?.map((step, index) => (
            <View
              key={index}
              className='my-2 p-4 flex-row justify-between items-start bg-white rounded-md'
            >
              <View className='flex-1'>
                <Text className='font-semibold pb-2'>
                  {index + 1}: {step.title}
                </Text>
                <Text>{step.content}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
