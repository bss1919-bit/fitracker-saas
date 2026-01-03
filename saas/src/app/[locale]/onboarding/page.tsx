import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { getTranslations } from 'next-intl/server';

export default async function OnboardingPage() {
    const t = await getTranslations('Onboarding');

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center space-y-4">
                    <div className="font-black text-4xl tracking-tight text-white">
                        FitTracker <span className="text-indigo-500">Pro</span>
                    </div>
                    <h1 className="text-xl font-medium text-slate-400">{t('title')}</h1>
                </div>
                <OnboardingWizard />
            </div>
        </div>
    );
}
