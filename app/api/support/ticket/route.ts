import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("notifications").insert([
      {
        user_id: user.id,
        title: `Support Ticket: ${subject}`,
        message,
        type: "system",
        metadata: { ticket: true, status: "open" },
      },
      {
        user_id: user.id,
        title: "We received your message",
        message: `Our team will reply about "${subject}" within 24-48 hours.`,
        type: "system",
        metadata: { confirmation: true },
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Support ticket error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
