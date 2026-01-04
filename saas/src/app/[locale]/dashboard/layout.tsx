import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getImpersonatedCoachId } from "@/lib/auth/impersonation";
import { ShieldAlert, LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const supabase = await createClient();
    const impersonatedCoachId = await getImpersonatedCoachId();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect({ href: '/auth/login', locale });
        return null;
    }

    // Check if user is an admin
    const adminSupabase = createAdminClient();
    const { data: admin } = await adminSupabase
        .from('admins')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    // If admin and NOT impersonating, redirect to admin panel
    if (admin && !impersonatedCoachId) {
        redirect({ href: '/admin', locale });
        return null;
    }

    // Determine target coach ID (either himself or impersonated)
    const targetCoachId = impersonatedCoachId || user.id;

    // Check if onboarding is completed for the target coach
    const { data: coach } = await supabase
        .from('coaches')
        .select('onboarding_completed, business_name')
        .eq('id', targetCoachId)
        .single();

    if (coach && !coach.onboarding_completed && !impersonatedCoachId) {
        redirect({ href: '/onboarding', locale });
        return null;
    }

    const tAdmin = await getTranslations("Admin");

    return (
        <div className="min-h-screen bg-slate-950">
            {impersonatedCoachId && (
                <div className="bg-indigo-600 px-4 py-2 flex items-center justify-between sticky top-0 z-[60] shadow-lg">
                    <div className="flex items-center gap-2 text-white text-sm font-bold">
                        <ShieldAlert size={16} />
                        <span>{tAdmin("impersonation.banner", { name: coach?.business_name || 'Coach' })}</span>
                    </div>
                    <form action="/api/auth/exit-impersonation" method="POST">
                        <button type="submit" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-white text-xs font-black transition-colors">
                            <LogOut size={14} /> {tAdmin("impersonation.exit")}
                        </button>
                    </form>
                </div>
            )}
            <Sidebar isAdmin={!!admin} isImpersonating={!!impersonatedCoachId} />
            <div className="lg:ps-64 flex flex-col min-h-screen">
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
