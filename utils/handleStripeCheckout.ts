import { Tables } from "@/types_db";
import {
  initPaymentSheet,
  presentPaymentSheet,
} from "@stripe/stripe-react-native";
import { User } from "@supabase/supabase-js";
import { Alert } from "react-native";

type Price = Tables<"prices">;

export async function handleStripeCheckout({
  price,
  user,
}: {
  price: Price;
  user: User | null | undefined;
}) {
  try {
    // const { data: user } = await supabase.auth.getUser();
    console.log("PRICE", price);
    console.log("USER", user);

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/intents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price, user }),
      }
    );

    // console.log("INTENT FROM CLIENT", await response.json());  //nese eshte aktive jep Already read error
    if (response.status !== 200) {
      // Alert.alert("Something went wrong", response?.error?.raw?.code);
      // Alert.alert("Something went wrongz", JSON.stringify(jsonResponse));
      console.log("PAYMENT INTENT RESPONSE ERROR", response);
      return;
    }
    const jsonResponse = await response.json();

    const initResponse = await initPaymentSheet({
      merchantDisplayName: "AIppetizer",
      paymentIntentClientSecret: jsonResponse.clientSecret,
      allowsDelayedPaymentMethods: true,
      returnURL: process.env.EXPO_PUBLIC_APP_BASE_URL || "/",
    });

    if (initResponse.error) {
      console.log("INIT RESPONSE ERROR", initResponse.error.message);
      Alert.alert("Something went wrongg", initResponse.error.code);
    }

    const { error } = await presentPaymentSheet();

    if (error) {
      console.log("ERROR FROM CLIENT INTENT 1", error);
      //   Alert.alert(`${error}`, error.message);
    } else {
      Alert.alert("Success", "Your order is confirmed!");
    }
  } catch (error) {
    console.log("ERROR FROM CLIENT INTENT 2", error);
  }
}
