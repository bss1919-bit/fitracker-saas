"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const onboardingSchema = z.object({
    businessName: z.string().optional(),
    website: z.string().optional(),
    specialties: z.string().optional(),
})

export function OnboardingWizard() {
    const t = useTranslations('Onboarding');
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(1);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<z.infer<typeof onboardingSchema>>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            businessName: "",
            website: "",
            specialties: "",
        },
    })

    async function onSubmit(values: z.infer<typeof onboardingSchema>) {
        console.log("Submitting form...", values);
        if (step === 1) {
            setStep(2);
            return;
        }

        // Final Submission
        try {
            console.log("Final submission step");
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            let logoUrl = null;

            if (logoFile) {
                setIsUploading(true);
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `${user.id}/logo.${fileExt}`;

                // Upload to Supabase Storage (bucket 'coach-assets')
                // Note: We need to create this bucket first or assume it exists. 
                // I'll assume we need to handle bucket creation error or just try upload.
                const { error: uploadError, data } = await supabase.storage
                    .from('coach-assets')
                    .upload(fileName, logoFile, { upsert: true });

                if (uploadError) {
                    console.error("Upload error", uploadError);
                    toast.error("Logo upload failed, but saving profile...");
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('coach-assets')
                        .getPublicUrl(fileName);
                    logoUrl = publicUrl;
                }
                setIsUploading(false);
            }

            const specialtiesArray = values.specialties
                ? values.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
                : [];

            const { error } = await supabase
                .from('coaches')
                .update({
                    business_name: values.businessName || null,
                    website: values.website || null,
                    specialties: specialtiesArray,
                    logo_url: logoUrl,
                    onboarding_completed: true
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("Profile Setup Complete!");
            router.push('/dashboard');
            router.refresh();

        } catch (error: any) {
            toast.error("Error: " + error.message);
            setIsUploading(false);
        }
    }

    return (
        <Card className="w-full max-w-lg bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader>
                <CardTitle>{step === 1 ? t('step1Title') : t('step2Title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Validation errors:", errors))} className="space-y-6">

                        {step === 1 && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="businessName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('businessName')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="FitTracker Elite Coaching" {...field} className="bg-slate-950 border-slate-800" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormItem>
                                    <FormLabel>{t('logo')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                            className="bg-slate-950 border-slate-800 cursor-pointer text-slate-400 file:text-indigo-400 file:bg-slate-900 file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-md hover:file:bg-slate-800"
                                        />
                                    </FormControl>
                                    <FormDescription>{t('logoDescription')}</FormDescription>
                                </FormItem>

                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('website')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} className="bg-slate-950 border-slate-800" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {step === 2 && (
                            <FormField
                                control={form.control}
                                name="specialties"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('specialtiesLabel')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('specialtiesPlaceholder')} {...field} className="bg-slate-950 border-slate-800" />
                                        </FormControl>
                                        <FormDescription>Separate with commas</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="flex justify-between pt-4">
                            {step > 1 && (
                                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                    {t('back')}
                                </Button>
                            )}
                            <Button type="submit" disabled={isUploading} className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white">
                                {isUploading ? t('uploading') : (step === 2 ? t('finish') : t('next'))}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
