import CustomButton from "@/components/CustomButton";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  useColorScheme,
  TextInput,
  Button,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from "react-native";

export default function AiGenerate() {
  const colorScheme = useColorScheme();

  const [result, setResult] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const { user } = useAuth();

  async function fetchVertex(prompt: string) {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/generateRecipe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, userId: user?.id }),
        }
      );

      if (response.status !== 200) {
        const { error, plan, limit, usage } = await response.json();
        if (usage >= limit) {
          setLimitReached(true);
        }
        Alert.alert(
          error,
          `You are currently in the ${plan} plan.
          AI recipes generated: ${usage} / ${limit}`
        );
        console.log("Error: Status not 200 but:", response.status);
      } else {
        // console.log("DATA FROM VERTEX", response);
        const { recipe } = await response.json();

        // const extractedTexts =
        //   data.contentResponse.candidates[0].content.parts[0].text;
        const extractedRecipe = recipe.candidates[0].content.parts[0].text;
        const recipeJson = JSON.parse(extractedRecipe);

        const { data: recipeData, error } = await supabase
          .from("Recipes")
          .insert(recipeJson)
          .select();

        if (recipeData && recipeData.length > 0) {
          try {
            setGeneratingImage(true);
            const response = await fetch(
              `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/generateImage`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  prompt,
                  userId: user?.id,
                  recipeId: recipeData[0].id,
                }),
              }
            );

            if (response.status !== 200) {
              console.log(
                "Error Gen image: Status not 200 but:",
                response.status
              );
            } else {
              // console.log("IMAGEN RESSS", await response.json());

              const { image } = await response.json();

              // console.log("IMGGG", image);

              const { error } = await supabase
                .from("Recipes")
                .update({
                  image_url: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${image?.fullPath}`,
                })
                .eq("id", recipeData[0].id);

              if (error) {
                Alert.alert(
                  "Error",
                  "Something went wrong uploading the image"
                  // error.message
                );
              }

              setGeneratingImage(false);
              router.push(`/recipes/${recipeData[0].id}`);
            }
          } catch (error) {
            console.log("ERROR FROM Generating image", error);
          } finally {
            setGeneratingImage(false);
          }
        }

        // setResult(extractedRecipe);
      }
    } catch (error) {
      console.log("ERROR FROM FETCHING VERTEX", error);
    } finally {
      setLoading(false);
    }

    // alert('Hello ' + data.hello);
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          className={`${Platform.OS === "android" ? "pt-36" : "pt-24"} px-4`}
        >
          <Text
            className={colorScheme === "dark" ? "text-white" : "text-primary"}
          >
            Prompt:
          </Text>
          <View className='justify-between items-center flex-row w-full'>
            <TextInput
              value={prompt}
              onChangeText={(e) => setPrompt(e)}
              // onChangeText={generate_from_text_input}
              keyboardType='default'
              autoComplete='off'
              autoCapitalize='none'
              multiline
              className={`flex-1 border border-border focus:border-accent px-3 py-3 my-4 rounded-lg max-h-80 min-h-24 ${
                colorScheme === "dark" ? "text-white" : "text-primary"
              }`}
            />
          </View>
          <CustomButton
            // disabled={limitReached}
            onPress={() => (fetchVertex(prompt), setPrompt(""))}
          >
            {loading || generatingImage ? (
              <View className='flex-row items-center gap-4'>
                <Text className='text-white'>Generating recipe...</Text>
                <ActivityIndicator color='white' size='small' />
              </View>
            ) : (
              <Text className='text-white'>Generate</Text>
            )}
          </CustomButton>
          <Text
            className={colorScheme === "dark" ? "text-white" : "text-black"}
          >
            {result}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
