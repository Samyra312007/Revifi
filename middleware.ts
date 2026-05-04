import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) return res;

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet) =>
        toSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options),
        ),
    },
  });

  await supabase.auth.getUser();
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
