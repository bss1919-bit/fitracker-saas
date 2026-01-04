"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { toast } from "sonner"
import { Loader2, Mail, Lock, User } from "lucide-react"

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
import { cn } from "@/lib/utils"

export function RegisterForm() {
    const t = useTranslations('Auth');
    const locale = useLocale();
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
        router.push('/onboarding');
        router.refresh();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className={cn(
                                "text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1",
                                locale === 'ar' && "tracking-normal"
                            )}>
                                {t('fullName')}
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <User className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input
                                        placeholder={t("namePlaceholder")}
                                        {...field}
                                        className="bg-slate-950 border-slate-800 h-14 ps-12 rounded-2xl font-bold text-white focus:ring-indigo-500/20 shadow-inner"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className={cn(
                                "text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1",
                                locale === 'ar' && "tracking-normal"
                            )}>
                                {t('email')}
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input
                                        placeholder={t("emailPlaceholder")}
                                        {...field}
                                        className="bg-slate-950 border-slate-800 h-14 ps-12 rounded-2xl font-bold text-white focus:ring-indigo-500/20 shadow-inner"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className={cn(
                                "text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1",
                                locale === 'ar' && "tracking-normal"
                            )}>
                                {t('password')}
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input
                                        type="password"
                                        {...field}
                                        className="bg-slate-950 border-slate-800 h-14 ps-12 rounded-2xl font-bold text-white focus:ring-indigo-500/20 shadow-inner"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className={cn(
                                "text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1",
                                locale === 'ar' && "tracking-normal"
                            )}>
                                {t('confirmPassword')}
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input
                                        type="password"
                                        {...field}
                                        className="bg-slate-950 border-slate-800 h-14 ps-12 rounded-2xl font-bold text-white focus:ring-indigo-500/20 shadow-inner"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className={cn(
                        "w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] mt-4",
                        locale === 'ar' && "tracking-normal"
                    )}
                >
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" size={20} /> : t('register')}
                </Button>
            </form>
        </Form>
    )
}
