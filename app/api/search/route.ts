import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface InvoiceSearchRow {
  id: string;
  deal_name: string;
  amount: number;
  status: string;
  brands?: { company_name?: string } | { company_name?: string }[] | null;
}

interface TransactionSearchRow {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

interface BrandSearchRow {
  id: string;
  company_name: string;
  industry?: string | null;
}

interface NotificationSearchRow {
  id: string;
  title: string;
  message: string;
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (!q) return NextResponse.json({ results: [] });

    const like = `%${q}%`;
    const { data: creator } = await supabase
      .from("creators")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const results: Array<{
      type: string;
      id: string;
      title: string;
      subtitle?: string;
      href: string;
    }> = [];

    if (creator) {
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, deal_name, amount, status, brands:brand_id(company_name)")
        .eq("creator_id", creator.id)
        .or(`deal_name.ilike.${like},status.ilike.${like}`)
        .limit(8);
      ((invoices as InvoiceSearchRow[] | null) || []).forEach((i) => {
        const brandName = Array.isArray(i.brands)
          ? i.brands?.[0]?.company_name
          : i.brands?.company_name;
        results.push({
          type: "deal",
          id: i.id,
          title: i.deal_name,
          subtitle: `${brandName || "Brand"} · $${Number(i.amount).toLocaleString()} · ${i.status}`,
          href: "/creator/deals",
        });
      });
    }

    const { data: txs } = await supabase
      .from("transactions")
      .select("id, type, amount, status, created_at, metadata")
      .eq("user_id", user.id)
      .or(`type.ilike.${like},status.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(8);
    ((txs as TransactionSearchRow[] | null) || []).forEach((t) => {
      results.push({
        type: "transaction",
        id: t.id,
        title: `${t.type[0].toUpperCase()}${t.type.slice(1)} · $${Number(t.amount).toLocaleString()}`,
        subtitle: `${t.status} · ${new Date(t.created_at).toLocaleDateString()}`,
        href: "/creator/payments",
      });
    });

    const { data: brands } = await supabase
      .from("brands")
      .select("id, company_name, industry")
      .ilike("company_name", like)
      .limit(5);
    ((brands as BrandSearchRow[] | null) || []).forEach((b) => {
      results.push({
        type: "brand",
        id: b.id,
        title: b.company_name,
        subtitle: b.industry || "Brand",
        href: "/creator/deals",
      });
    });

    const { data: notifications } = await supabase
      .from("notifications")
      .select("id, title, message, type, created_at")
      .eq("user_id", user.id)
      .or(`title.ilike.${like},message.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(5);
    ((notifications as NotificationSearchRow[] | null) || []).forEach((n) => {
      results.push({
        type: "notification",
        id: n.id,
        title: n.title,
        subtitle: n.message?.slice(0, 80) || "",
        href: "/creator/dashboard",
      });
    });

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error("Search error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
