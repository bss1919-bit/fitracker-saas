import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { Sidebar } from "@/components/dashboard/sidebar"; // We might want a different sidebar for admin later

export default async function AdminLayout({
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

    // Check if user is an admin bypassing RLS
    const adminSupabase = createAdminClient();
    const { data: admin } = await adminSupabase
        .from('admins')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (!admin) {
        // Not an admin, redirect to normal dashboard
        redirect({ href: '/dashboard', locale });
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar isAdmin={true} /> {/* For now reuse sidebar, but will adapt it */}
            <div className="lg:ps-64 flex flex-col min-h-screen">
                <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
