"use server"

import { setImpersonationCookie } from "@/lib/auth/impersonation";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { revalidatePath } from "next/cache";

export async function impersonateCoach(coachId: string, locale: string) {
    const adminSupabase = createAdminClient();

    // Safety check: ensure current user is actually an admin
    const { data: { user } } = await adminSupabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: isAdmin } = await adminSupabase
        .from('admins')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (!isAdmin) throw new Error("Unauthorized");

    // Set cookie
    await setImpersonationCookie(coachId);

    // Redirect to coach dashboard
    revalidatePath('/', 'layout');
    redirect({ href: '/dashboard', locale });
}

export async function updateCoachStatus(coachId: string, status: 'active' | 'suspended' | 'banned') {
    const adminSupabase = createAdminClient();

    // Safety check: ensure current user is actually an admin
    const { data: { user } } = await adminSupabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: isAdmin } = await adminSupabase
        .from('admins')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (!isAdmin) throw new Error("Unauthorized");

    const { error } = await adminSupabase
        .from('coaches')
        .update({ status } as any)
        .eq('id', coachId);

    if (error) throw error;
    revalidatePath('/admin');
}
