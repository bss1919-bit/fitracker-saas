import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";

const handleI18n = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    // 1. Run next-intl middleware first to get the response with locale setup
    const response = handleI18n(request);

    // 2. Refresh Supabase Session
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // This will refresh the session if needed
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 3. Protected Routes Protection
    // Check if the path (minus locale) starts with /dashboard
    const pathname = request.nextUrl.pathname;

    // Regex to strip locale (e.g. /fr/dashboard -> /dashboard)
    const pathWithoutLocale = pathname.replace(/^\/(fr|en|ar)/, '');

    const isDashboard = pathWithoutLocale.startsWith('/dashboard');
    const isAuthPage = pathWithoutLocale.startsWith('/auth');

    if (isDashboard && !user) {
        // Redirect to login
        // We use the current locale to determine where to send them
        // Assuming /auth/login exists
        const locale = request.nextUrl.locale || 'fr'; // Or extract from path
        // For now, simple redirect, next-intl middleware might handle locale but we do it manually safely
        const url = request.nextUrl.clone();
        url.pathname = `/fr/auth/login`; // Defaulting to fr for safety if parsing fails, or extract logic
        // Actually better to let next-intl handle locale, but we need to know WHICH locale.
        // The handleI18n might have set a header or we can parse URL.

        // Simple approach: just redirect to /auth/login and let middleware handle locale prefix if missing?
        // No, infinite loop if not careful.

        // Robust approach:
        // If we are at /fr/dashboard, redirect to /fr/auth/login
        // We can rely on the fact that pathWithoutLocale extraction works.
        const currentLocale = pathname.match(/^\/(fr|en|ar)/)?.[1] || 'fr';
        url.pathname = `/${currentLocale}/auth/login`;
        return NextResponse.redirect(url);
    }

    if (isAuthPage && user) {
        // If user is already logged in, redirect to dashboard
        const currentLocale = pathname.match(/^\/(fr|en|ar)/)?.[1] || 'fr';
        const url = request.nextUrl.clone();
        url.pathname = `/${currentLocale}/dashboard`;
        return NextResponse.redirect(url);
    }

    return response;
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next`, `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        "/((?!api|_next|_vercel|.*\\..*).*)",
    ],
};
