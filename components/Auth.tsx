import {
  Alert,
  Button,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../utils/supabase";
import { useState } from "react";
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession(); // required for web only
const redirectTo = makeRedirectUri();

// console.log("REDIRECT TO", redirectTo);

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  console.log("SESSION SUPABASE", data.session);
  return data.session;
};

const performOAuth = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(
    data?.url ?? "",
    redirectTo
  );

  if (res.type === "success") {
    const { url } = res;
    await createSessionFromUrl(url);
  }
};

export default function Auth() {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [sending, setSending] = useState(false);
  const colorScheme = useColorScheme();

  const sendMagicLink = async () => {
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true, // explicitly set this to true
          data: {
            email: email, // include email in user metadata
          },
        },
      });

      if (error) {
        console.error("Signup error details:", error); // Add detailed error logging
        Alert.alert(
          "Error saving the user",
          error.message || "An unexpected error occurred during signup"
        );
      } else {
        setIsOTPSent(true);
      }
    } catch (error) {
      console.error("Error sending magic link:", error);
      Alert.alert(
        "Error",
        "There was a problem sending the magic link. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) {
      Alert.alert("Error", error.message);
      return { data: null, error };
    }
    return { data, error: null };
  };

  const handleVerifyOTP = async () => {
    try {
      // Your existing OTP verification logic
      const { data, error } = await verifyOtp();

      // console.log("URSSSS", userData, error);

      if (!error && data) {
        // Assign free plan after successful verification
        // const response = await fetch(
        //   `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/assignFreePlan`,
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       userId: data?.user?.id,
        //       email: data?.user?.email,
        //     }),
        //   }
        // );

        // if (!response.ok) {
        //   const error = await response.json();
        //   throw new Error(error.message);
        // }

        // Handle success
        router.push("/recipes");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      // Handle error
    }
  };

  // Handle linking into app from email app.
  const url = Linking.useURL();
  // console.log("LINKING URL SUPABASE", url);
  if (url) createSessionFromUrl(url);

  return (
    <>
      {/* <Button onPress={sendMagicLink} title='Send Magic Link' /> */}

      <View>
        {!isOTPSent ? (
          <>
            <Button onPress={performOAuth} title='Sign in with Google' />

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder='email'
              keyboardType='email-address'
              autoComplete='email'
              autoCapitalize='none'
              className={`border border-border focus:border-accent px-4 py-2 my-4 rounded-md min-w-52 ${
                colorScheme === "dark" ? "text-white" : "text-primary"
              }`}
            />

            <Button
              title={sending ? "Sending..." : "Send OTP"}
              onPress={sendMagicLink}
            />
          </>
        ) : (
          <>
            <Text>Please check your email for the login code</Text>
            <TextInput
              placeholder='Enter OTP'
              value={otp}
              onChangeText={setOTP}
              keyboardType='numeric'
              className={`border border-border focus:border-accent px-4 py-2 my-4 rounded-md min-w-52 ${
                colorScheme === "dark" ? "text-white" : "text-primary"
              }`}
            />
            <Button title='Verify OTP' onPress={handleVerifyOTP} />
          </>
        )}
      </View>
    </>
  );
}
