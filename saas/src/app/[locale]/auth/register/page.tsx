import { RegisterForm } from '@/components/auth/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function RegisterPage() {
    const t = await getTranslations('Auth');

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-white">{t('registerTitle')}</CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        {t('registerDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm />
                    <div className="mt-4 text-center text-sm text-slate-400">
                        <Link href="/auth/login" className="hover:text-indigo-400 transition-colors">
                            {t('alreadyHaveAccount')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
