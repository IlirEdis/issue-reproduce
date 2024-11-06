export const handlePlanSwitch = async ({
  subscriptionId,
  priceId,
}: {
  subscriptionId?: string;
  priceId: string;
}) => {
  const apiEndpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;

  try {
    await fetch(`${apiEndpoint}/api/updateSubscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriptionId: subscriptionId,
        priceId: priceId,
      }),
    });
    // if (response.status === 200) {
    //   // const subscription = await response.json();
    //   // console.log("SUBBB", subscription);
    //   // router.push("/membership");
    // //   return { switchingPlan };
    // }
  } catch (error) {
    console.log("ERROR FROM PLAN SWITCH", error);
  }
};
