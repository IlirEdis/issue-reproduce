import Stripe from "stripe";

// const calculateOrderAmount = (items) => {
//   // Calculate the order total on the server to prevent
//   // people from directly manipulating the amount on the client
//   let total = 0;
//   items.forEach((item) => {
//     total += item.amount;
//   });
//   return total;
// };

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const amount = await request.json();
  const customer = await stripe.customers.create();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    // console.log("THE INTENT", paymentIntent);

    return Response.json({ paymentIntent: paymentIntent.client_secret });
  } catch (error) {
    console.log("ERROR FROM PAYMENT INTENT", error);
    return Response.json({ error, status: 400 });
  }
}
