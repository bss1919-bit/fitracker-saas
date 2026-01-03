import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';

export default async function LoginPage() {
    const t = await getTranslations('Auth');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 space-y-8">
            <div className="text-center">
                <div className="font-black text-4xl tracking-tight text-white">
                    FitTracker <span className="text-indigo-500">Pro</span>
                </div>
            </div>
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-white">{t('loginTitle')}</CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        {t('loginDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                    <div className="mt-4 text-center text-sm text-slate-400">
                        <Link href="/auth/register" className="hover:text-indigo-400 transition-colors">
                            {t('noAccount')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
