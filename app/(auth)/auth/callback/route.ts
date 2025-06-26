import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    console.log("Auth callback received:", { code: !!code, next }); // Debug log

    if (code) {
      const supabase = await createClient();
      
      console.log("Exchanging code for session..."); // Debug log
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Code exchange error:", error); // Debug log
        return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`);
      }

      if (data.user) {
        console.log("Code exchange successful, user:", data.user.id); // Debug log
        
        // Determine redirect URL
        const isLocalEnv = process.env.NODE_ENV === "development";
        const forwardedHost = request.headers.get("x-forwarded-host");
        
        if (isLocalEnv) {
          console.log("Redirecting to:", `${origin}${next}`); // Debug log
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          const redirectUrl = `https://${forwardedHost}${next}`;
          console.log("Redirecting to:", redirectUrl); // Debug log
          return NextResponse.redirect(redirectUrl);
        } else {
          console.log("Redirecting to:", `${origin}${next}`); // Debug log
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    }

    console.log("No code provided, redirecting to error"); // Debug log
    return NextResponse.redirect(`${origin}/auth/error?error=no_code`);
  } catch (error) {
    console.error("Callback route error:", error); // Debug log
    const { origin } = new URL(request.url);
    return NextResponse.redirect(`${origin}/auth/error?error=callback_failed`);
  }
}