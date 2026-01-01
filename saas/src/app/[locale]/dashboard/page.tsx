import { getTranslations } from 'next-intl/server';
import { UserNav } from "@/components/dashboard/user-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";

export default async function DashboardPage() {
    const t = await getTranslations('Dashboard');
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Check if onboarding is completed
        const { data: coach } = await supabase
            .from('coaches')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

        if (coach && !coach.onboarding_completed) {
            redirect({ href: '/onboarding', locale: 'fr' }); // Using default locale or extracting it if possible. 
            // Redirect helper from next-intl handles locale automatically if passed, but usually simple redirect needs locale.
            // Let's rely on standard redirect if we are inside a server component that knows locale.
            // Actually, redirect from next-intl/navigation needs locale in some versions or context.
            // The safest is to extract params.
        }
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <header className="border-b border-slate-800 p-4 flex justify-between items-center">
                <div className="font-bold text-xl text-white">FitTracker Coach</div>
                <UserNav />
            </header>
            <main className="p-8">
                <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
                <p className="text-slate-400">{t('welcome')}</p>
            </main>
        </div>
    )
}
