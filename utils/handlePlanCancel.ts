export const handlePlanCancel = async ({
  subscriptionId,
}: {
  subscriptionId: string;
}) => {
  const apiEndpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;

  try {
    const response = await fetch(`${apiEndpoint}/api/cancelSubscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    });

    if (response.status === 200) {
      const subscription = await response.json();

      console.log("CANC#EL", subscription);
      return subscription;
    }
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

// const cancelSubscription = async (subscriptionId) => {
//   const apiEndpoint =
//     Platform.OS === "ios" ? "http://localhost:4242" : "http://10.0.2.2:4567";
//   const response = await fetch(`${apiEndpoint}/cancel-subscription`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       subscriptionId: subscriptionId,
//     }),
//   });
//   if (response.status === 200) {
//     const subscription = await response.json();
//     return subscription;
//   }
// };
