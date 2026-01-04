"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { toast } from "sonner"
import { Loader2, Mail, Lock } from "lucide-react"

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

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export function LoginForm() {
    const t = useTranslations('Auth');
    const locale = useLocale();
    const router = useRouter();
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password
        })

        if (error) {
            toast.error(t("loginError", { message: error.message }));
            return;
        }

        toast.success(t('loginTitle'));
        router.push('/dashboard');
        router.refresh();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className={cn(
                        "w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] mt-4",
                        locale === 'ar' && "tracking-normal"
                    )}
                >
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" size={20} /> : t('signIn')}
                </Button>
            </form>
        </Form>
    )
}
