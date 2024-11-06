import React, { useEffect, useRef, useState } from "react";
import { Redirect, router, Tabs } from "expo-router";
import { useAuth } from "@/context/AuthProvider";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { supabase } from "@/utils/supabase";
import CustomBottomSheetModal from "@/components/CustomBottomSheetModal";
import {
  BottomSheetModal,
  BottomSheetTextInput,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import CustomButton from "@/components/CustomButton";
import { ArrowLeft, Cpu, PencilLine, Plus, User } from "lucide-react-native";

export default function ProtectedLayout() {
  const { isAuthenticated, user } = useAuth();
  // const auth = useAuth();
  const colorScheme = useColorScheme();
  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeData, setRecipeData] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);

  const { dismiss } = useBottomSheetModal();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const handleOpenBottomSheet = () => bottomSheetRef.current?.present();

  // if (!isAuthenticated) {
  //   return <Redirect href='/' />;
  // }

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const AddRecipe = async () => {
    setLoading(true);
    setRecipeTitle("");
    try {
      const { data, error } = await supabase
        .from("Recipes")
        .insert({ title: recipeTitle, from_user: user?.id })
        .select();

      setRecipeData(data);

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
    } catch (error) {
      console.log("ERROR FROM ADD RECIPE", error);
    } finally {
      setLoading(false);
    }
    // console.log("INS ERROR", error);
    // console.log("INS DATA", data);
  };

  useEffect(() => {
    if (recipeData && recipeData.length > 0) {
      router.push(`/recipes/${recipeData[0].id}/edit`);
      dismiss();
    }
  }, [recipeData]);

  // const router = useRouter();

  return (
    <View className='relative flex-1 bg-slate-400 w-full'>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={({ navigation, state, descriptors }) => (
          <View
            className='bg-white'
            style={{
              flexDirection: "row",
              // backgroundColor: "red",
              position: "absolute",
              paddingBottom: 15,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            {/* {state.routes.map((route, index) => { */}
            {state.routes
              .filter((route) => {
                // Filter out routes that should be hidden
                const { options } = descriptors[route.key];
                return (
                  !["_sitemap", "+not-found", "account"].includes(route.name) &&
                  //@ts-ignore
                  options.href !== null
                );
              })
              .map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                  options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                    ? options.title
                    : route.name;

                // if (["_sitemap", "+not-found"].includes(route.name)) return null;
                const isFocused = state.index === index;

                const onPress = () => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    // @ts-ignore
                    router.push(route.name);
                  }
                };

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={onPress}
                    // style={{ flex: 1, alignItems: "center", padding: 8 }}
                    className={`flex-1 items-center p-4`}
                  >
                    {options.tabBarIcon &&
                      options.tabBarIcon({
                        focused: isFocused,
                        color: `${isFocused ? "#688E26" : "#1E2019"}`,
                        size: 20,
                      })}
                    <Text
                      className={`${
                        isFocused ? "text-accent" : "text-secondary"
                      } pt-1 text-sm`}
                    >
                      {typeof label === "function"
                        ? label({
                            focused: isFocused,
                            color: "blue",
                            position: "below-icon",
                            children: "",
                          })
                        : label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            {/* <TouchableOpacity
              onPress={handleOpenBottomSheet}
              style={{ flex: 1, alignItems: "center", padding: 16 }}
            >
              <Text style={{ fontSize: 24, color: "white" }}>+</Text>
              <Text style={{ color: "white", fontSize: 12 }}>Add Recipe</Text>
            </TouchableOpacity> */}
          </View>
        )}
      >
        <Tabs.Screen
          name='recipes'
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <PencilLine size={size} color={color} />
            ),
            tabBarLabel: "Recipes",
          }}
        />
        <Tabs.Screen
          name='ai-generate'
          options={{
            tabBarIcon: ({ color, size }) => <Cpu size={size} color={color} />,
            tabBarLabel: "AI Generate",
          }}
        />

        <Tabs.Screen
          name='membership'
          options={{
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
            tabBarLabel: "Membership",
          }}
        />
        <Tabs.Screen
          name='account'
          options={{
            href: null,
          }}
        />
      </Tabs>

      <View className='absolute bg-white/50 blur-lg w-full'>
        <SafeAreaView>
          <View
            className={`${
              Platform.OS === "android" ? "mt-14" : ""
            } flex-row justify-between items-center mx-4 my-2`}
          >
            <Pressable
              onPress={() => router.back()}
              className='w-8 h-8 rounded-full bg-accent items-center justify-center'
            >
              <ArrowLeft color='white' width={18} />
            </Pressable>

            <Pressable onPress={handleSignOut}>
              <Text
                className={colorScheme === "dark" ? "text-white" : "text-black"}
              >
                Sign out
              </Text>
              <Text
                className={colorScheme === "dark" ? "text-white" : "text-black"}
              >
                {user?.email}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleOpenBottomSheet}
              className='w-8 h-8 rounded-full bg-accent items-center justify-center'
            >
              <Plus color='white' width={18} />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <CustomBottomSheetModal ref={bottomSheetRef} snapPoints={["40%"]}>
        <Text className='text-xl font-bold'>Add new recipe</Text>
        <Text className='text-slate-500 pb-2'>
          The title for your new recipe
        </Text>
        <BottomSheetTextInput
          placeholder='Title'
          className='border p-2 my-2 rounded-md'
          value={recipeTitle}
          onChangeText={setRecipeTitle}
          // multiline
        />
        {/* <Button title='Add new recipe' /> */}
        <CustomButton
          title='Add new recipe'
          containerClassName='bg-accent rounded-md'
          contentClassName='justify-center items-center'
          textClassName='text-white'
          onPress={AddRecipe}
        >
          {loading ? (
            <ActivityIndicator size='small' color='#fff' />
          ) : (
            <Text className='text-white font-bold'>Add new recipe</Text>
          )}
        </CustomButton>
      </CustomBottomSheetModal>
    </View>
  );
}
