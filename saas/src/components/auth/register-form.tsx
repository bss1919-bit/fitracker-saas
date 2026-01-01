"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

const registerSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export function RegisterForm() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const supabase = createClient();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        // 1. Sign Up/Register in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
                data: {
                    full_name: values.fullName
                }
            }
        })

        if (authError) {
            toast.error(authError.message);
            return;
        }

        if (!authData.user) {
            toast.error("Something went wrong during registration.");
            return;
        }

        // 2. Create the Coach Profile in 'public.coaches'
        // Note: In a real production app, this is often done via a Postgres Trigger on auth.users insert
        // But for simplicity/control in this MVP, we can do it client-side (protected by RLS) or via an API endpoint.
        // Given the RLS policy "Coaches can insert own profile" (auth.uid() = id), we can do it here.

        const { error: profileError } = await supabase
            .from('coaches')
            .insert({
                id: authData.user.id,
                email: values.email,
                full_name: values.fullName,
                // business_name, subscription_tier etc will be handled in Onboarding
            });

        if (profileError) {
            // Fallback: If profile creation fails, we might want to alert the user or try again.
            // The Auth user is created, so they can technically login, but they won't have a profile.
            console.error("Profile creation failed:", profileError);
            toast.error("Account created but profile setup failed. Please contact support.");
            return;
        }

        toast.success(t('registerTitle')); // reusing title or success message

        // Redirect to onboarding (or dashboard if we skip onboarding for now)
        // We'll direct to dashboard for now, onboarding comes next step.
        router.push('/dashboard');
        router.refresh();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('fullName')}</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} className="bg-slate-900 border-slate-800" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('email')}</FormLabel>
                            <FormControl>
                                <Input placeholder="coach@example.com" {...field} className="bg-slate-900 border-slate-800" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('password')}</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} className="bg-slate-900 border-slate-800" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('confirmPassword')}</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} className="bg-slate-900 border-slate-800" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    {form.formState.isSubmitting ? t('loading') : t('register')}
                </Button>
            </form>
        </Form>
    )
}
