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

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        subject,
        message,
        email: user.email,
        status: "open",
      })
      .select()
      .single();

    if (ticketError) {
      return NextResponse.json(
        { error: ticketError.message },
        { status: 500 },
      );
    }

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Support ticket received",
      message: `We received your message about "${subject}". Our team will reply within 24-48 hours.`,
      type: "system",
      metadata: { ticket_id: ticket.id },
    });

    const supportEmail = process.env.SUPPORT_EMAIL_TO;
    const resendKey = process.env.RESEND_API_KEY;
    if (supportEmail && resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.SUPPORT_EMAIL_FROM || "support@revifi.com",
            to: supportEmail,
            reply_to: user.email,
            subject: `[Revifi Support] ${subject}`,
            text: `From: ${user.email}\nUser ID: ${user.id}\nTicket ID: ${ticket.id}\n\n${message}`,
          }),
        });
      } catch (err) {
        console.error("Resend email failed (non-fatal):", err);
      }
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error("Support ticket error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
