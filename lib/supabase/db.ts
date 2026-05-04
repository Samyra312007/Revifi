import { createClient } from "./server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCreatorProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("creators")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

export async function getUserInvoices(userId: string) {
  const supabase = await createClient();

  const creator = await getCreatorProfile(userId);
  if (!creator) return [];

  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("creator_id", creator.id)
    .order("created_at", { ascending: false });
  return data || [];
}
