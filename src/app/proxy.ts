import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

    let user = null;

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        // Refresh the session token
        const { data } = await supabase.auth.getUser();
        user = data.user;

        // Protect /admin routes
        if (isAdminRoute && user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (!profile || profile.role !== "admin") {
                const url = request.nextUrl.clone();
                url.pathname = "/";
                return NextResponse.redirect(url);
            }
        }
    } catch (error) {
        // Si Supabase est inaccessible, on laisse passer les pages publiques
        console.error("Middleware Supabase error:", error);
    }

    // Protect /admin routes - redirect to login if not authenticated
    if (isAdminRoute && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}


