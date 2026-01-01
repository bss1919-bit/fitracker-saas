import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from 'next-intl/server';

export default async function LoginPage() {
    const t = await getTranslations('Auth');

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-white">{t('loginTitle')}</CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        {t('loginDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    );
}
