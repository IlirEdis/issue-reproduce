import RecipeCard from "@/components/RecipeCard";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";

export default function Recipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    if (user?.id) {
      const { data, error } = await supabase
        .from("Recipes")
        .select()
        .eq("from_user", user.id);

      setLoading(false);

      if (error) {
        console.error("Error fetching recipes:", error);
      } else {
        setRecipes(data);
      }
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [fetchRecipes])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      fetchRecipes();

      // setKvmSession(params);
    } catch (error) {
      console.log("fetching all kvm details error on refresh", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // if (loading) {
  //   return <ActivityIndicator />;
  // }

  return (
    <SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        className='h-full'
      >
        {/* <Stack.Screen options={{ headerShown: false }} /> */}
        <View
          className={`flex-row flex-wrap px-2 pb-4 ${
            Platform.OS === "android" ? "pt-36" : "pt-24"
          }`}
        >
          {recipes?.map((recipe) => {
            return (
              <View key={recipe.id} className='w-1/2 p-2'>
                <RecipeCard
                  title={recipe.title}
                  id={recipe.id}
                  imageUrl={recipe.image_url}
                />
              </View>

              // <View className='w-1/2 p-2'>
              //   <RecipeCard title={recipe.title} />
              // </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
