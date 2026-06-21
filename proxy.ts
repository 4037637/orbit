import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { user, supabase } = await updateSession(request, response);

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isDashboard = pathname.startsWith("/dashboard");
  const isOnboarding = pathname.startsWith("/onboarding");

  // Unauthenticated users cannot access protected routes
  if (!user && (isDashboard || isOnboarding)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For authenticated users on auth pages, dashboard, or onboarding:
  // check onboarding status and route accordingly
  if (user && (isAuthPage || isDashboard || isOnboarding)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .single();

    const done = profile?.onboarding_complete ?? false;

    // Auth pages and dashboard before onboarding → send to onboarding (or dashboard if done)
    if (isAuthPage || (isDashboard && !done)) {
      return NextResponse.redirect(
        new URL(done ? "/dashboard" : "/onboarding", request.url)
      );
    }

    // Completed onboarding users don't need to re-visit /onboarding
    if (isOnboarding && done) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
