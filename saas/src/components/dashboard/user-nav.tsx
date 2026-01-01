"use client"

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function UserNav() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const supabase = createClient();

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error(error.message);
            return;
        }

        // Redirect to login
        router.push('/auth/login');
        router.refresh(); // Clear server component cache
    }

    return (
        <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-400 hover:bg-slate-800">
            {t('logout')}
        </Button>
    );
}
