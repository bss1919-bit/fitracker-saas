import { getTranslations } from 'next-intl/server';
import { UserNav } from "@/components/dashboard/user-nav";

export default async function DashboardPage() {
    const t = await getTranslations('Dashboard');

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
