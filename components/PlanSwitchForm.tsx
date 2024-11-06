import { useState } from "react";
import { Tables } from "@/types_db";
import { Link, router } from "expo-router";
import CustomButton from "./CustomButton";
import { ActivityIndicator, Text, View } from "react-native";
import Card from "./Card";
import { handleStripeCheckout } from "@/utils/handleStripeCheckout";
import { useAuth } from "@/context/AuthProvider";
import { handlePlanSwitch } from "@/utils/handlePlanSwitch";

type Subscription = Tables<"subscriptions">;
type Price = Tables<"prices">;
type Product = Tables<"products">;

type SubscriptionWithPriceAndProduct = Subscription & {
  prices:
    | (Price & {
        products: Product | null;
      })
    | null;
};

type BillingInterval = "month" | "year" | "day" | "week" | null | undefined;
interface ProductWithPrices extends Product {
  prices: Price[];
}

interface Props {
  subscription: SubscriptionWithPriceAndProduct | null;
  products: ProductWithPrices[];
}

export default function PlanSwitchForm({
  subscription,
  products,
}: Props & { products: ProductWithPrices[] }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [switchingPlan, setSwitchingPlan] = useState<Record<string, boolean>>(
    {}
  );

  // const [billingInterval, setBillingInterval] = useState<BillingInterval>(
  //   subscription?.prices?.interval || "month"
  // );
  const billingInterval = subscription?.prices?.interval || "month";

  const availableProducts = products
    ?.filter(
      (product) =>
        // Only show products that are NOT the current subscription's product
        product.id !== subscription?.prices?.products?.id
    )
    .sort((a, b) => {
      const priceA =
        a.prices.find((p) => p.interval === billingInterval)?.unit_amount || 0;
      const priceB =
        b.prices.find((p) => p.interval === billingInterval)?.unit_amount || 0;
      return priceB - priceA;
    });

  // Only show the "Available plans" section if there are actually plans to switch to
  const hasAvailablePlans = availableProducts?.length > 0;

  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: subscription?.prices?.currency!,
      minimumFractionDigits: 0,
    }).format((subscription?.prices?.unit_amount || 0) / 100);

  // const handleStripePortalRequest = async () => {
  //   setIsSubmitting(true);
  //   const redirectUrl = await createStripePortal(currentPath);
  //   setIsSubmitting(false);
  //   return router.push(redirectUrl);
  // };

  // const handlePlanSwitch = async ({
  //   subscriptionId,
  //   priceId,
  // }: {
  //   subscriptionId?: string;
  //   priceId: string;
  // }) => {
  //   const apiEndpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;
  //   setSwitchingPlan(true);
  //   try {
  //     const response = await fetch(`${apiEndpoint}/api/updateSubscription`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         subscriptionId: subscriptionId,
  //         priceId: priceId,
  //       }),
  //     });
  //     if (response.status === 200) {
  //       // const subscription = await response.json();
  //       // console.log("SUBBB", subscription);
  //       router.push("/membership");
  //       // return subscription;
  //     }
  //   } catch (error) {
  //     console.log("ERROR FROM PLAN SWITCH", error);
  //   } finally {
  //     setSwitchingPlan(false);
  //   }
  // };

  console.log("SUBSCRIPTION TyPE", subscription);

  return (
    <Card
      title='Your Plan'
      description={
        subscription
          ? `You are currently on the ${subscription?.prices?.products?.name} plan.`
          : "You are not currently subscribed to any plan."
      }
      footer={
        hasAvailablePlans ? (
          <View className='flex flex-col items-start justify-between'>
            <Text className='pb-4'>Available plans to switch to:</Text>

            <View className='flex-row gap-4'>
              {availableProducts?.map((product) => {
                const price = product.prices.find(
                  (p) => p.interval === billingInterval
                );
                if (!price) return null;

                const priceString = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: price.currency!,
                  minimumFractionDigits: 0,
                }).format((price?.unit_amount || 0) / 100);

                return (
                  <View key={product.id} className='mb-4'>
                    <Text className='text-lg font-semibold'>
                      {product.name}
                    </Text>
                    <Text>
                      {priceString}/{billingInterval}
                    </Text>
                    <CustomButton
                      onPress={async () => {
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
                      }}
                      containerClassName='mt-2'
                      disabled={switchingPlan[price.id]}
                    >
                      {switchingPlan[price.id] ? (
                        <View className='flex-row gap-2'>
                          <Text>Switching plan...</Text>
                          <ActivityIndicator size='small' color='#fff' />
                        </View>
                      ) : (
                        <Text>Switch to {product.name}</Text>
                      )}
                    </CustomButton>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null
      }
    >
      <View className='mt-8 mb-4'>
        {subscription && (
          <View>
            <Text className='text-xl font-semibold'>Current Plan:</Text>
            <Text className='text-lg'>
              {subscription?.prices?.products?.name} - {subscriptionPrice}/
              {subscription?.prices?.interval}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
