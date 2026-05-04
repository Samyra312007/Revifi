import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=missing_code", requestUrl.origin),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/?error=auth_failed", requestUrl.origin),
    );
  }

  try {
    const admin = createAdminClient();
    const user = data.user;
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.email ? user.email.split("@")[0] : "Creator");

    await admin
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email!,
          full_name: fullName,
          user_type: "creator",
        },
        { onConflict: "id" },
      );

    await admin
      .from("creators")
      .upsert(
        { user_id: user.id, display_name: fullName },
        { onConflict: "user_id" },
      );
  } catch (err) {
    console.warn("Self-heal users/creators rows failed:", err);
  }

  return NextResponse.redirect(
    new URL("/creator/dashboard", requestUrl.origin),
  );
}
