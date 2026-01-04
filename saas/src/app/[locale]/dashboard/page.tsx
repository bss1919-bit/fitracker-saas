import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { QRInvitation } from "@/components/dashboard/qr-invitation"
import { LinkClientDialog } from "@/components/clients/link-client-dialog"
import { Users, Dumbbell, Calendar, ArrowUpRight, Activity } from "lucide-react"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Dashboard")
    return {
        title: `${t("title")} | FitTracker Pro`,
    }
}

export default async function DashboardPage() {
    const t = await getTranslations("Dashboard")
    const activitiesT = await getTranslations("Activities")
    const supabase = await createClient()

    // Get current session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch coach profile
    const { data: coach } = await supabase
        .from("coaches")
        .select("full_name")
        .eq("id", user.id)
        .single()

    const displayName = coach?.full_name || user.user_metadata?.full_name || t("coach")

    // Fetch some quick stats
    const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", user.id)

    const { count: programsCount } = await supabase
        .from("coach_programs")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", user.id)

    // Count synced data in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: sessionsCount } = await supabase
        .from("synced_data")
        .select("*, clients!inner(coach_id)", { count: "exact", head: true })
        .eq("clients.coach_id", user.id)
        .gte("performed_at", thirtyDaysAgo.toISOString())

    const stats = [
        { label: t("activeClients"), value: clientsCount || 0, icon: Users, color: "text-blue-400" },
        { label: t("programsBuilt"), value: programsCount || 0, icon: Dumbbell, color: "text-indigo-400" },
        { label: t("activeSessions"), value: sessionsCount || 0, icon: Calendar, color: "text-emerald-400" },
    ]

    // Fetch recent activity for the whole coach
    const { data: recentActivities } = await supabase
        .from("synced_data")
        .select(`
            *,
            clients (
                first_name,
                last_name
            )
        `)
        .eq("clients.coach_id", user.id)
        .order("performed_at", { ascending: false })
        .limit(5)

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        {t("title")}
                    </h1>
                    <p className="text-slate-400 text-lg">
                        {t("welcome", { name: (coach?.full_name || user.user_metadata?.full_name || 'Coach').split(' ')[0] })}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <LinkClientDialog />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 group hover:border-slate-700 transition-all">
                        <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                        <ArrowUpRight className="ms-auto text-slate-700 group-hover:text-slate-400 transition-colors" size={20} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity size={20} className="text-indigo-500" />
                            {t("recentActivity")}
                        </h3>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                        {(!recentActivities || recentActivities.length === 0) ? (
                            <div className="p-12 text-center space-y-4">
                                <div className="p-4 bg-slate-950 rounded-full border border-slate-800 text-slate-400 inline-block">
                                    <Calendar size={32} />
                                </div>
                                <p className="text-slate-500 max-w-xs mx-auto">{t("noActivity")}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400">
                                                <Dumbbell size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight truncate">
                                                    {activity.clients?.first_name} {activity.clients?.last_name}
                                                </p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                                                    {activitiesT.has(activity.data_type) ? activitiesT(activity.data_type) : activity.data_type.replace("_", " ")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                {activity.performed_at ? new Date(activity.performed_at).toLocaleDateString() : "-"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <QRInvitation coachId={user.id} coachName={displayName} />
                </div>
            </div>
        </div>
    )
}
