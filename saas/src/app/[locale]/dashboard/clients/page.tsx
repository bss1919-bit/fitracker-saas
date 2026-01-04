import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { ClientList } from "@/components/clients/client-list"
import { AddClientDialog } from "@/components/clients/add-client-dialog"
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
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
                    <p className="text-slate-400 mt-1">{t("searchPlaceholder")}</p>
                </div>
                <AddClientDialog />
            </div>

            <ClientList clients={clients || []} />
        </div>
    )
}
