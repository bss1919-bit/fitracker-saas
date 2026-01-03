import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect({ href: '/auth/login', locale });
        return null;
    }

    // Check if onboarding is completed
    const { data: coach } = await supabase
        .from('coaches')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

    if (coach && !coach.onboarding_completed) {
        redirect({ href: '/onboarding', locale });
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
