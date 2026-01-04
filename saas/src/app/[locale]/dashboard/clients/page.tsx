import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { ClientList } from "@/components/clients/client-list"
import { AddClientDialog } from "@/components/clients/add-client-dialog"
import { LinkClientDialog } from "@/components/clients/link-client-dialog"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Clients")
    return {
        title: `${t("title")} | FitTracker Pro`,
    }
}

export default async function ClientsPage() {
    const t = await getTranslations("Clients")
    const supabase = await createClient()

    // Get current coach
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch clients
    const { data: clients, error } = await supabase
        .from("clients")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching clients:", error)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t("title")}</h1>
                    <p className="text-slate-400">{t("form.addNewDescription")}</p>
                </div>
                <div className="flex gap-4">
                    <LinkClientDialog />
                    <AddClientDialog />
                </div>
            </header>

            <ClientList clients={clients || []} />
        </div>
    )
}
