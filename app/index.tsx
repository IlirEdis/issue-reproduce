import { Button, KeyboardAvoidingView, SafeAreaView, Text } from "react-native";

import { Redirect, router } from "expo-router";
import Auth from "@/components/Auth";
import { useAuth } from "@/context/AuthProvider";

export default function Index() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href='/recipes' />;
  }

  return (
    <SafeAreaView className='h-full bg-accent justify-center items-center'>
      <KeyboardAvoidingView behavior='padding'>
        <Text>Home screen</Text>
        <Auth />

        <Button onPress={() => router.push("/membership")} title='Membership' />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
