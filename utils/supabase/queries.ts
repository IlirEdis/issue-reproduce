import { SupabaseClient } from "@supabase/supabase-js";
// import { cache } from 'react';

export const getUser = async (supabase: SupabaseClient) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getSubscription = async (supabase: SupabaseClient) => {
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*, prices(*, products(*))")
    .in("status", ["trialing", "active"])
    .maybeSingle();

  return subscription;
};

export const getProducts = async (supabase: SupabaseClient) => {
  const { data: products, error } = await supabase
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .eq("prices.active", true)
    .order("metadata->index")
    .order("unit_amount", { referencedTable: "prices", ascending: false });

  return products;
};

export const getUserDetails = async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from("users")
    .select("*")
    .single();
  return userDetails;
};
