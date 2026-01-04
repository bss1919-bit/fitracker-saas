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

export function RegisterForm() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const supabase = createClient();

    const registerSchema = z.object({
        fullName: z.string().min(2, t("nameRequired")),
        email: z.string().email(t("invalidEmail")),
        password: z.string().min(6, t("passwordLength")),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: t("passwordMismatch"),
        path: ["confirmPassword"],
    });

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
            toast.error(t("registrationError"));
            return;
        }

        const { error: profileError } = await supabase
            .from('coaches')
            .insert({
                id: authData.user.id,
                email: values.email,
                full_name: values.fullName,
            });

        if (profileError) {
            console.error("Profile creation failed:", profileError);
            toast.error(t("profileError"));
            return;
        }

        toast.success(t('registerTitle'));

        // Redirect to onboarding
        router.push('/onboarding');
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
                                <Input placeholder={t("namePlaceholder")} {...field} className="bg-slate-900 border-slate-800" />
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
                                <Input placeholder={t("emailPlaceholder")} {...field} className="bg-slate-900 border-slate-800" />
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
