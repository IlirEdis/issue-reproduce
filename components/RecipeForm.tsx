import { useEffect, useRef, useState } from "react";
import {
  Controller,
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpFormSchema, SignUpFormSchema } from "@/utils/signupFormSchema";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
} from "react-native";
import { getReadableValidationErrorMessage } from "@/utils/formUtils";
import { View } from "react-native";
import { Pressable } from "react-native";
// import { TextInput } from "./CustomTextInput";
import { supabase } from "@/utils/supabase";
import CustomButton from "./CustomButton";
import { router } from "expo-router";
import CustomBottomSheetModal from "./CustomBottomSheetModal";
import {
  BottomSheetTextInput,
  BottomSheetModal,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { TextInput } from "./CustomTextInput";
import { Save, Trash } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { decode } from "base64-arraybuffer";
import { useAuth } from "@/context/AuthProvider";

export const RecipeForm: React.FC<{ initialData: Recipe }> = ({
  initialData,
}) => {
  //   const [isModalVisible, setIsModalVisible] = useState(false);
  const [stepTitle, setStepTitle] = useState("");
  const [stepContent, setStepContent] = useState("");
  const [localTitle, setLocalTitle] = useState(initialData?.title || "");
  const [notes, setNotes] = useState(initialData.notes || "");
  const [editing, setEditing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const handleOpenBottomSheet = () => bottomSheetRef.current?.present();
  const { dismiss: dismissModal } = useBottomSheetModal();

  const { user } = useAuth();

  const methods = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      ...initialData,
      title: localTitle,
      notes: initialData?.notes,
      steps: initialData?.steps || [],
      isPublic: initialData?.isPublic || false,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (initialData?.title) {
      setLocalTitle(initialData.title);
    }
  }, [initialData?.title]);

  const onSubmit: SubmitHandler<SignUpFormSchema> = async (updatedData) => {
    setEditing(true);
    try {
      const { error } = await supabase
        .from("Recipes")
        .update({ ...updatedData, image_url: methods.getValues("image_url") })
        .eq("id", initialData?.id);

      if (error) {
        console.log("ERROR ON SUBMIT", error);
        Alert.alert("Error", error.message);
      }

      router.replace("/recipes");
    } catch (error) {
      console.log("ERROR PREJ SUBMIT CATCH", error);
    } finally {
      setEditing(false);
    }
  };

  const onError: SubmitErrorHandler<SignUpFormSchema> = (errors, e) => {
    console.log(JSON.stringify(errors));
    Alert.alert("Warning", getReadableValidationErrorMessage(errors));
  };

  const { control, setValue, watch } = methods;
  const steps = watch("steps");

  const addStep = () => {
    if (stepTitle && stepContent) {
      setValue("steps", [...steps, { title: stepTitle, content: stepContent }]);
      setStepTitle("");
      setStepContent("");
      //   setIsModalVisible(false);
      dismissModal();
    }
  };

  const deleteStep = (indexToDelete: number) => {
    const updatedSteps = steps.filter((_, index) => index !== indexToDelete);
    setValue("steps", updatedSteps);
  };

  const [image, setImage] = useState<string | null>(
    initialData?.image_url || null
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      await uploadImage(result.assets[0].base64);
    }
  };

  const uploadImage = async (base64Image: string) => {
    const fileName = `${user?.id}/recipe_${initialData.id}_${Date.now()}.jpg`;
    setImageUploading(true);
    try {
      const { data, error } = await supabase.storage
        .from("recipe-images")
        .upload(fileName, decode(base64Image), {
          contentType: "image/jpeg",
        });

      if (error) {
        console.error("Error uploading image:", error);
        Alert.alert("Error", "Failed to upload image");
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("recipe-images").getPublicUrl(fileName);

        setValue("image_url", publicUrl);
      }
    } catch (error) {
      console.log("ERROR FROM IMAGE UPLOAD", error);
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <View>
      <ScrollView className='h-full'>
        <FormProvider {...methods}>
          <View className='flex-row justify-between items-start gap-4'>
            <Pressable onPress={pickImage} className='flex-1'>
              {image ? (
                <Image
                  source={{ uri: image }}
                  className='w-full h-40 rounded-md'
                />
              ) : (
                <View className='w-full h-40 bg-gray-200 rounded-md justify-center items-center'>
                  <Text>Tap to add an image</Text>
                </View>
              )}
            </Pressable>

            <View className='gap-4 flex-1'>
              <Controller
                control={methods.control}
                name='title'
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => {
                  return (
                    <TextInput
                      label='Title'
                      onBlur={onBlur}
                      // value={localTitle}
                      value={value}
                      placeholder={localTitle}
                      onChangeText={(text) => {
                        setLocalTitle(text);
                        onChange(text);
                      }}
                      errorMessage={error?.message}
                    />
                  );
                }}
              />

              <View>
                <Text className='pb-2'>Public?</Text>

                <Controller
                  control={methods.control}
                  name='isPublic'
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => {
                    return (
                      <Switch
                        value={value}
                        onValueChange={(newValue) => onChange(newValue)}
                      />
                    );
                  }}
                />
              </View>
            </View>
          </View>

          <Controller
            control={methods.control}
            name='notes'
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => {
              return (
                <TextInput
                  label='Notes'
                  onBlur={onBlur}
                  // value={localTitle}
                  value={value}
                  // placeholder={localTitle}
                  onChangeText={(text) => {
                    setNotes(text);
                    onChange(text);
                  }}
                  errorMessage={error?.message}
                  multiline
                  className='min-h-32 bg-white px-3 py-2'
                />
              );
            }}
          />

          {/* <Controller
          control={methods.control}
          name='ingredients'
          render={({
            field: { onChange, onBlur, value, ref },
            fieldState: { error },
          }) => {
            return (
              <View>
                <Text>Ingredients</Text>
                <View>
                  {GENDER_OPTIONS.map((genderOption) => (
                    <Pressable
                      key={genderOption}
                      style={[
                        // styles.genderOptionPressable,
                        {
                          backgroundColor:
                            value === genderOption ? "#007BFF" : "#F2F2F2",
                        },
                      ]}
                      onPress={() => onChange(genderOption)}
                    >
                      <Text
                        style={[
                          //   styles.genderOptionText,
                          {
                            color: value === genderOption ? "#fff" : "#000",
                          },
                        ]}
                      >
                        {genderOption}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {!!error?.message && <Text>{error.message}</Text>}
              </View>
            );
          }}
        /> */}

          <View className='flex-col'>
            {steps.map((step, index) => (
              <View
                key={index}
                className='my-4 p-2 flex-row justify-between items-start bg-white rounded-md'
              >
                <View className='flex-1'>
                  <Text className='font-semibold pb-2'>
                    Step {index + 1}: {step.title}
                  </Text>
                  <Text>{step.content}</Text>
                </View>
                <Pressable onPress={() => deleteStep(index)} className='p-2'>
                  <View className='w-4 h-4'>
                    <Trash color='gray' width={20} />
                  </View>
                </Pressable>
              </View>
            ))}

            <CustomButton
              containerClassName='bg-transparent border border-accent rounded-md'
              contentClassName='justify-center items-center'
              // textClassName='text-accent'
              onPress={handleOpenBottomSheet}
            >
              <Text className='text-accent font-bold'>Add steps</Text>
            </CustomButton>
          </View>

          <CustomBottomSheetModal ref={bottomSheetRef} snapPoints={["40%"]}>
            <Text className='text-xl font-bold'>Add step</Text>
            <Text className='text-slate-500 pb-2'>The title for this step</Text>
            <BottomSheetTextInput
              placeholder='Step Title'
              className='border border-border p-2 my-2 rounded-md'
              value={stepTitle}
              onChangeText={setStepTitle}
            />

            <BottomSheetTextInput
              placeholder='Step Content'
              className='border border-border h-36 p-2 my-2 rounded-md'
              // value={stepContent}
              onChangeText={setStepContent}
              multiline
              autoCorrect={false}
            />

            {/* <Button title='Add new recipe' /> */}
            <CustomButton
              containerClassName='bg-accent rounded-md'
              contentClassName='justify-center items-center'
              textClassName='text-white'
              onPress={addStep}
            >
              <Text className='text-white font-bold'>Add step</Text>
            </CustomButton>
          </CustomBottomSheetModal>

          {/* <Button
          onPress={methods.handleSubmit(onSubmit, onError)}
          title='Submit Form'
          color={"#007BFF"}
        /> */}
        </FormProvider>
      </ScrollView>

      <CustomButton
        onPress={methods.handleSubmit(onSubmit, onError)}
        disabled={imageUploading}
        containerClassName='absolute bottom-24 right-4'
      >
        {editing || imageUploading ? (
          <>
            <ActivityIndicator size='small' color='#fff' />
            <Text className='text-white font-semibold'>Editing...</Text>
          </>
        ) : (
          <>
            <Save color='white' width={20} />
            <Text className='text-white font-semibold'>Save</Text>
          </>
        )}
      </CustomButton>
    </View>
  );
};
