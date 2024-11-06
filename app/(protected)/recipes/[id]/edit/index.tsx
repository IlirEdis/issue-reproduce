import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { RecipeForm } from "@/components/RecipeForm";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

export default function EditRecipe() {
  const params = useLocalSearchParams();
  // console.log("PARAMS", params);

  const [recipe, setRecipe] = useState<Recipe[] | null>(null);

  useEffect(() => {
    const getRecipes = async () => {
      const { data, error } = await supabase
        .from("Recipes")
        .select()
        .eq("id", params.id);

      setRecipe(data);
    };

    getRecipes();
  }, []);

  if (!recipe) {
    return (
      <View className='items-center justify-center flex-1'>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView>
        <View className='pt-24 px-4'>
          <RecipeForm initialData={recipe![0]} />
        </View>
      </SafeAreaView>
    </>
  );
}
