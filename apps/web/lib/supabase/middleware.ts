import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/overview", "/answers", "/queries", "/mentions", "/competitors", "/opportunities", "/reports", "/settings", "/onboarding"];
const AUTH_PAGES = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  // Supabase falls back to the bare Site URL when a redirect isn't allow-listed;
  // finish the sign-in instead of dropping the code on the home page.
  const code = request.nextUrl.searchParams.get("code");
  if (request.nextUrl.pathname === "/" && code) {
    const callback = request.nextUrl.clone();
    callback.pathname = "/auth/callback";
    callback.search = "";
    callback.searchParams.set("code", code);
    callback.searchParams.set("next", "/overview"); // sends new users on to onboarding
    return NextResponse.redirect(callback);
  }

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() verifies the JWT with Supabase Auth — never trust getSession() for authz.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && PROTECTED_PREFIXES.some((p) => path.startsWith(p))) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  if (user && AUTH_PAGES.includes(path)) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/overview";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return response;
}
