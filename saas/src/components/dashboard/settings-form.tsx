"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "@/i18n/routing"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Settings2 } from "lucide-react"

const settingsSchema = z.object({
    fullName: z.string().min(2),
    businessName: z.string().optional(),
    website: z.string().optional(),
    specialties: z.string().optional(),
    units: z.enum(["metric", "imperial"]),
})

interface SettingsFormProps {
    initialData: {
        id: string
        full_name: string | null
        business_name: string | null
        website: string | null
        specialties: string[] | null
        settings: any
    }
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const t = useTranslations("Settings")
    const tAuth = useTranslations("Auth")
    const locale = useLocale()
    const router = useRouter()
    const supabase = createClient()

    const [isSaving, setIsSaving] = useState(false)
    const [logoFile, setLogoFile] = useState<File | null>(null)

    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            fullName: initialData.full_name || "",
            businessName: initialData.business_name || "",
            website: initialData.website || "",
            specialties: initialData.specialties?.join(", ") || "",
            units: initialData.settings?.units || "metric",
        },
    })

    async function onSubmit(values: z.infer<typeof settingsSchema>) {
        try {
            setIsSaving(true)

            let logoUrl = undefined
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop()
                const fileName = `${initialData.id}/logo.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('coach-assets')
                    .upload(fileName, logoFile, { upsert: true })

                if (uploadError) {
                    console.error("Upload error", uploadError)
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('coach-assets')
                        .getPublicUrl(fileName)
                    logoUrl = publicUrl
                }
            }

            const specialtiesArray = values.specialties
                ? values.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
                : []

            const { error } = await supabase
                .from('coaches')
                .update({
                    full_name: values.fullName,
                    business_name: values.businessName || null,
                    website: values.website || null,
                    specialties: specialtiesArray,
                    ...(logoUrl && { logo_url: logoUrl }),
                    settings: {
                        ...initialData.settings,
                        units: values.units
                    }
                })
                .eq('id', initialData.id)

            if (error) throw error

            toast.success(t("success"))
            router.refresh()
        } catch (error: any) {
            toast.error(t("error"))
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleLanguageChange = (newLocale: string) => {
        router.replace("/dashboard/settings", { locale: newLocale })
    }

    const isRtl = locale === 'ar'

    return (
        <Tabs defaultValue="profile" className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
            <TabsList className="bg-slate-900 border-slate-800 mb-8 p-1">
                <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex gap-2">
                    <User size={16} /> {t("profile")}
                </TabsTrigger>
                <TabsTrigger value="preferences" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex gap-2">
                    <Settings2 size={16} /> {t("preferences")}
                </TabsTrigger>
            </TabsList>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <TabsContent value="profile" className="mt-0">
                        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-slate-950/50 border-b border-slate-800 p-8">
                                <CardTitle className="text-2xl font-black">{t("profile")}</CardTitle>
                                <CardDescription className="text-slate-500">{t("description")}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t("fullName")}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-indigo-500" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="businessName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t("businessName")}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-indigo-500" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t("website")}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-indigo-500" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="specialties"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t("specialties")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t("specialtiesPlaceholder")} {...field} className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-indigo-500" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-800">
                                    <FormItem>
                                        <FormLabel className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t("logo")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                                className="bg-slate-950 border-slate-800 cursor-pointer text-slate-400 file:text-indigo-400 file:bg-slate-900 file:border-0 file:me-4 file:px-4 file:py-2 file:rounded-md hover:file:bg-slate-800 mt-2"
                                            />
                                        </FormControl>
                                    </FormItem>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="preferences" className="mt-0">
                        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-slate-950/50 border-b border-slate-800 p-8">
                                <CardTitle className="text-2xl font-black">{t("preferences")}</CardTitle>
                                <CardDescription className="text-slate-500">How the platform looks and feels to you.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="max-w-md space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t("language")}</label>
                                        <Select value={locale} onValueChange={handleLanguageChange}>
                                            <SelectTrigger className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-indigo-500">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                <SelectItem value="en">English (US)</SelectItem>
                                                <SelectItem value="fr">Français (FR)</SelectItem>
                                                <SelectItem value="ar">العربية (Arabic)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="units"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t("units")}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-indigo-500">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                        <SelectItem value="metric">{t("metric")}</SelectItem>
                                                        <SelectItem value="imperial">{t("imperial")}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-12 h-14 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                            {isSaving ? (
                                <><Loader2 className="me-2 h-5 w-5 animate-spin" /> {tAuth("loading")}</>
                            ) : (
                                t("save")
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </Tabs>
    )
}
