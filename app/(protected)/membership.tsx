// import { useAuth } from "@/context/AuthProvider";
import Pricing from "@/components/Pricing";
import { supabase } from "@/utils/supabase";
import { Button, Platform, SafeAreaView, ScrollView, View } from "react-native";
import {
  getUser,
  getProducts,
  getSubscription,
  getUserDetails,
} from "@/utils/supabase/queries";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/types_db";
import { router, Stack } from "expo-router";

type Subscription = Tables<"subscriptions">;
type Product = Tables<"products">;
type Price = Tables<"prices">;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

export default function Membership() {
  const [user, setUser] = useState<User | null | undefined>(null);
  const [userDetails, setUserDetails] = useState<User | null | undefined>(null);
  const [products, setProducts] = useState<ProductWithPrices[] | null>(null);
  const [subscription, setSubscription] =
    useState<SubscriptionWithProduct | null>(null);

  async function getPricingDetails() {
    const [user, userDetails, products, subscription] = await Promise.all([
      getUser(supabase),
      getUserDetails(supabase),
      getProducts(supabase),
      getSubscription(supabase),
    ]);

    setUser(user);
    setUserDetails(userDetails);
    setProducts(products);
    setSubscription(subscription);
  }

  // console.log("USRR DETAILSSS", userDetails);

  const getPaymentMethod = async ({
    paymentMethodId,
  }: {
    paymentMethodId: string;
  }) => {
    const apiEndpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;
    // setSwitchingPlan(true);
    try {
      const response = await fetch(`${apiEndpoint}/api/getPaymentMethod`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId,
        }),
      });
      if (response.status === 200) {
        const paymentMethod = await response.json();

        console.log("PPPPP", paymentMethod);
        // router.push("/membership");
        // return subscription;
      }
    } catch (error) {
      console.log("ERROR FROM PLAN SWITCH", error);
    } finally {
      // setSwitchingPlan(false);
    }
  };

  useEffect(() => {
    getPricingDetails();
    // getPaymentMethod();
  }, [products]);

  // console.log("USSRRR", user);
  return (
    <SafeAreaView>
      <Stack.Screen options={{ presentation: "modal" }} />
      <ScrollView className='h-full'>
        <View
          className={`${Platform.OS === "android" ? "pt-36" : "pt-24"} flex-1`}
        >
          <Button title='Account' onPress={() => router.push("/account")} />
          {/* <Button title='Logout' onPress={() => supabase.auth.signOut()} /> */}

          {/* <Button title='Signup for 10usd' onPress={() => SignUp(1000.0)} /> */}
          <Pricing
            user={user}
            products={products ?? []}
            subscription={subscription}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
