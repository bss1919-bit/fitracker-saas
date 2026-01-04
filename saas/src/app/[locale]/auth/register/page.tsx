import { RegisterForm } from '@/components/auth/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function RegisterPage() {
    const t = await getTranslations('Auth');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <div className="font-black text-5xl tracking-tighter text-white">
                        FitTracker <span className="text-indigo-500">Pro</span>
                    </div>
                </div>

                <Card className="w-full bg-slate-900 border-slate-800 text-slate-100 rounded-[2.5rem] shadow-2xl shadow-black/50 border-2 border-indigo-500/5 p-2 overflow-hidden">
                    <CardHeader className="p-8 pb-4 space-y-2">
                        <CardTitle className="text-3xl font-black text-center text-white tracking-tight">{t('registerTitle')}</CardTitle>
                        <CardDescription className="text-center text-slate-500 font-medium">
                            {t('registerDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <RegisterForm />
                        <div className="mt-8 text-center">
                            <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-all">
                                {t('alreadyHaveAccount')}
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
