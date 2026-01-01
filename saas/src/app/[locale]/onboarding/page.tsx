import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { getTranslations } from 'next-intl/server';

export default async function OnboardingPage() {
    const t = await getTranslations('Onboarding');

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
                </div>
                <OnboardingWizard />
            </div>
        </div>
    );
}
