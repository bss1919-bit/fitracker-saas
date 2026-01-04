import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Settings")
    return {
        title: `${t("title")} | FitTracker Pro`,
    }
}

export default async function SettingsPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const supabase = await createClient()
    const t = await getTranslations("Settings")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return notFound()

    const { data: coach, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", user.id)
        .single()

    if (error || !coach) {
        return notFound()
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        {t("title")}
                    </h1>
                    <p className="text-slate-400">
                        {t("description")}
                    </p>
                </div>
            </header>

            <SettingsForm initialData={coach} />
        </div>
    )
}
