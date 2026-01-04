import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { SettingsForm } from "@/components/dashboard/settings-form"

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
        <div className="p-8 max-w-5xl mx-auto space-y-12">
            <header className="space-y-2">
                <h1 className="text-4xl font-black text-white tracking-tight">{t("title")}</h1>
                <p className="text-slate-500 text-lg">{t("description")}</p>
            </header>

            <SettingsForm initialData={coach} />
        </div>
    )
}
