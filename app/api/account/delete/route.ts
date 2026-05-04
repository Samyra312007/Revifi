import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    await admin.from("notifications").delete().eq("user_id", user.id);
    await admin.from("support_tickets").delete().eq("user_id", user.id);
    await admin.from("creator_platforms").delete().eq("user_id", user.id);
    await admin.from("withdrawals").delete().eq("user_id", user.id);
    await admin.from("transactions").delete().eq("user_id", user.id);

    const { data: creator } = await admin
      .from("creators")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (creator) {
      await admin.from("invoices").delete().eq("creator_id", creator.id);
      await admin.from("creators").delete().eq("user_id", user.id);
    }

    await admin.from("users").delete().eq("id", user.id);

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(
      user.id,
    );
    if (deleteUserError) {
      return NextResponse.json(
        { error: deleteUserError.message },
        { status: 500 },
      );
    }

    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Delete account error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
