import { View, Text, SafeAreaView } from "react-native";
import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";

import { Tables } from "@/types_db";
import {
  getProducts,
  getSubscription,
  getUser,
  getUserDetails,
} from "@/utils/supabase/queries";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import PlanSwitchForm from "@/components/PlanSwitchForm";

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

export default function Account() {
  const [user, setUser] = useState<User | null | undefined>(null);
  const [userDetails, setUserDetails] = useState<ProductWithPrices[] | null>(
    null
  );
  const [subscription, setSubscription] =
    useState<SubscriptionWithProduct | null>(null);

  const [products, setProducts] = useState<ProductWithPrices[] | null>(null);

  // console.log("PPPP", products);

  async function getPricingDetails() {
    const [user, userDetails, subscription, products] = await Promise.all([
      getUser(supabase),
      getUserDetails(supabase),
      getSubscription(supabase),
      getProducts(supabase),
    ]);

    setUser(user);
    setUserDetails(userDetails);
    setSubscription(subscription);
    setProducts(products);
  }

  useEffect(() => {
    getPricingDetails();
  }, []);

  //   if (!user) {
  //     // return redirect('/signin');
  //     return <Redirect href='/' />;
  //   }

  return (
    <View className='mb-32 pt-32'>
      <View className='px-4 py-8'>
        <View>
          <Text className='text-4xl font-extrabold'>Account</Text>
          <Text className='mt-5 text-xl'>
            We partnered with Stripe for a simplified billing.
          </Text>
        </View>
      </View>
      <View className='p-4'>
        <PlanSwitchForm subscription={subscription} products={products!} />
        {/* <NameForm userName={userDetails?.full_name ?? ''} />
            <EmailForm userEmail={user.email} /> */}
      </View>
    </View>
  );
}
