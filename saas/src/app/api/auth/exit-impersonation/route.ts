import { clearImpersonationCookie } from "@/lib/auth/impersonation";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    await clearImpersonationCookie();

    // Redirect to admin dashboard
    const url = new URL(req.url);
    const locale = url.pathname.split('/')[1] || 'en';

    return Response.redirect(new URL(`/${locale}/admin`, req.url));
}
