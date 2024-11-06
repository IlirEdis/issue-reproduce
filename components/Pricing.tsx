import type { Tables } from "@/types_db";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { cn } from "@/utils/MergeClasses";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import CustomButton from "./CustomButton";
import { router } from "expo-router";
import { handleStripeCheckout } from "@/utils/handleStripeCheckout";
import { handlePlanSwitch } from "@/utils/handlePlanSwitch";
import { handlePlanCancel } from "@/utils/handlePlanCancel";

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

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = "lifetime" | "year" | "month";

export default function Pricing({
  user,
  products,
  subscription,
}: // paymentMethodId,
Props) {
  // console.log("PRODD", products);

  const [switchingPlan, setSwitchingPlan] = useState<Record<string, boolean>>(
    {}
  );

  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");

  const sortedProducts = [...products].sort((a, b) => {
    const Pro =
      a.prices.find((p) => p.interval === billingInterval)?.unit_amount || 0;
    const Plus =
      b.prices.find((p) => p.interval === billingInterval)?.unit_amount || 0;

    return Plus - Pro;
  });

  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product?.prices?.map((price) => price?.interval)
      )
    )
  );

  if (!products.length) {
    return (
      <View className='items-center justify-center flex-1'>
        <ActivityIndicator />
      </View>
    );
  } else {
    return (
      <View className='px-4 py-8 mx-auto'>
        <View>
          <Text className='text-4xl font-extrabold'>Pricing Plans</Text>
          <Text className='mt-5 text-xl '>
            Start building for free, then add a site plan to go live. Account
            plans unlock additional features.
          </Text>
          <View className='relative flex-row mt-6 border border-border rounded-lg p-0.5 bg-white'>
            {intervals.includes("month") && (
              <CustomButton
                onPress={() => setBillingInterval("month")}
                // type="button"
                containerClassName={`${
                  billingInterval === "month"
                    ? "relative w-1/2 bg-zinc-600 border-zinc-800 shadow-sm "
                    : "ml-0.5 relative bg-zinc-100 w-1/2 border border-transparent "
                } flex-1 rounded-md m-1 py-2 text-sm items-center font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10`}
              >
                <Text
                  className={`${
                    billingInterval === "month" ? "text-white" : "text-zinc-400"
                  }`}
                >
                  Monthly
                </Text>
              </CustomButton>
            )}
            {intervals.includes("year") && (
              <CustomButton
                onPress={() => setBillingInterval("year")}
                // type="button"
                containerClassName={`${
                  billingInterval === "year"
                    ? "relative w-1/2 bg-zinc-600 border-zinc-600 shadow-sm "
                    : "ml-0.5 relative bg-zinc-100 w-1/2 border border-transparent "
                } flex-1 rounded-md m-1 py-2 text-sm items-center font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10`}
              >
                <Text
                  className={`${
                    billingInterval === "year" ? "text-white" : "text-zinc-400"
                  }`}
                >
                  Yearly
                </Text>
                <View className=' bg-blue-100 rounded-full w-fit px-2 py-0.5 self-center'>
                  <Text className='text-xs text-blue-600 font-medium'>
                    2 months free
                  </Text>
                </View>
              </CustomButton>
            )}
          </View>
        </View>

        <View className='mt-12 space-y-0 flex-wrap flex-row justify-center gap-4'>
          {sortedProducts.map((product) => {
            const price = product?.prices?.find(
              (price) => price.interval === billingInterval
            );
            if (!price) return null;
            const priceString = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: price.currency!,
              minimumFractionDigits: 0,
            }).format((price?.unit_amount || 0) / 100);
            return (
              <View
                key={product.id}
                className={cn(
                  "flex flex-col rounded-lg border border-border bg-white",
                  {
                    "border-pink-500":
                      product.name === subscription?.prices?.products?.name,
                  },
                  "flex-1", // This makes the flex item grow to fill the space
                  "basis-1/3" // Assuming you want each card to take up roughly a third of the container's width
                  // "max-w-md" // Sets a maximum width to the cards to prevent them from getting too large
                )}
              >
                <View className='p-6 relative'>
                  {product.name === "Pro" ? (
                    <View className='absolute -top-2.5 bg-blue-100 rounded-full w-fit px-2 py-0.5 self-center'>
                      <Text className='text-xs text-blue-600 font-medium'>
                        Most popular
                      </Text>
                    </View>
                  ) : null}

                  <Text className='text-2xl font-semibold leading-6 '>
                    {product.name}
                  </Text>

                  <Text className='mt-4 '>{product.description}</Text>
                  <Text className='mt-8'>
                    <Text className='text-3xl font-extrabold '>
                      {priceString}
                    </Text>
                    <Text className='text-base font-medium '>
                      /{billingInterval}
                    </Text>
                  </Text>
                  {/* <CustomButton
                    // variant="slim"
                    // type="button"
                    // loading={priceIdLoading === price.id}
                    onPress={() =>
                      subscription &&
                      subscription?.prices?.products?.name === product.name
                        ? router.push({ pathname: "/account" })
                        : handlePlanSwitch({
                            subscriptionId: subscription?.id,
                            priceId: price.id,
                          })
                    }
                    // onPress={() => handleStripeCheckout({ price, user })}
                    containerClassName='w-full py-2 mt-8 rounded-md'
                  >
                    <Text className='text-white'>
                      {subscription?.prices?.products?.name === product.name
                        ? "Cancel plan"
                        : `Switch to ${product.name}`}
                    </Text>
                  </CustomButton> */}

                  <CustomButton
                    onPress={
                      subscription?.prices?.products?.name === product.name
                        ? async () => {
                            setSwitchingPlan((prev) => ({
                              ...prev,
                              [price.id]: true,
                            }));
                            try {
                              await handlePlanCancel({
                                subscriptionId: subscription?.id!,
                              });
                            } finally {
                              setSwitchingPlan((prev) => ({
                                ...prev,
                                [price.id]: false,
                              }));
                            }
                          }
                        : async () => {
                            setSwitchingPlan((prev) => ({
                              ...prev,
                              [price.id]: true,
                            }));
                            try {
                              await handlePlanSwitch({
                                subscriptionId: subscription?.id,
                                priceId: price.id,
                              });
                            } finally {
                              setSwitchingPlan((prev) => ({
                                ...prev,
                                [price.id]: false,
                              }));
                            }
                          }
                    }
                    containerClassName='mt-2'
                    disabled={switchingPlan[price.id]}
                  >
                    {switchingPlan[price.id] ? (
                      <View className='flex-row gap-2 items-center'>
                        <Text>Switching...</Text>
                        <ActivityIndicator size='small' color='#fff' />
                      </View>
                    ) : (
                      <Text className='text-white font-medium'>
                        {subscription?.prices?.products?.name === product.name
                          ? "Cancel plan"
                          : `Switch to ${product.name}`}
                      </Text>
                    )}
                  </CustomButton>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }
}
