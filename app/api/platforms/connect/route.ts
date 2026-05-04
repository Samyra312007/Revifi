import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SUPPORTED = ["youtube", "twitch", "instagram", "tiktok", "twitter"] as const;
type Platform = (typeof SUPPORTED)[number];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("creator_platforms")
    .select("platform, handle, follower_count, monthly_revenue, advance_limit, connected_at")
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ platforms: data || [] });
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const platform = String(body.platform || "").toLowerCase() as Platform;

    if (!SUPPORTED.includes(platform)) {
      return NextResponse.json(
        { error: `Unsupported platform. Use one of: ${SUPPORTED.join(", ")}` },
        { status: 400 },
      );
    }

    const handle = body.handle ? String(body.handle).trim() : null;
    const externalId = body.external_id ? String(body.external_id) : null;
    const accessToken = body.access_token ? String(body.access_token) : null;
    const refreshToken = body.refresh_token ? String(body.refresh_token) : null;
    const followerCount = Number(body.follower_count || 0);
    const monthlyRevenue = Number(body.monthly_revenue || 0);

    const advanceLimit = Math.min(
      100000,
      Math.max(5000, monthlyRevenue * 3 + followerCount * 0.05),
    );

    const { data, error } = await supabase
      .from("creator_platforms")
      .upsert(
        {
          user_id: user.id,
          platform,
          handle,
          external_id: externalId,
          access_token: accessToken,
          refresh_token: refreshToken,
          follower_count: followerCount,
          monthly_revenue: monthlyRevenue,
          advance_limit: advanceLimit,
          metadata: body.metadata || {},
        },
        { onConflict: "user_id,platform" },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} connected`,
      message: `Your advance limit was updated to $${Math.round(advanceLimit).toLocaleString()}.`,
      type: "system",
      metadata: { platform },
    });

    return NextResponse.json({ success: true, platform: data });
  } catch (error: unknown) {
    console.error("Platform connect error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    if (!platform) {
      return NextResponse.json(
        { error: "platform query param required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("creator_platforms")
      .delete()
      .eq("user_id", user.id)
      .eq("platform", platform);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
