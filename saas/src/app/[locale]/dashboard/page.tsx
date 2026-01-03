import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { QRInvitation } from "@/components/dashboard/qr-invitation"
import { Users, Dumbbell, Calendar, ArrowUpRight } from "lucide-react"

export default async function DashboardPage() {
    const t = await getTranslations("Dashboard")
    const supabase = await createClient()

    // Get current session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch some quick stats
    const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", user.id)

    const stats = [
        { label: "Active Clients", value: clientsCount || 0, icon: Users, color: "text-blue-400" },
        { label: "Programs Built", value: 0, icon: Dumbbell, color: "text-indigo-400" },
        { label: "Active Sessions", value: 0, icon: Calendar, color: "text-emerald-400" },
    ]

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <header>
                <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
                <p className="text-slate-400 mt-2">{t("welcome")}</p>
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
                        <ArrowUpRight className="ml-auto text-slate-700 group-hover:text-slate-400 transition-colors" size={20} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 bg-slate-950 rounded-full border border-slate-800 text-slate-400">
                            <Calendar size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">Your athletes haven't logged any workouts yet. Once they do, they'll appear here.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <QRInvitation coachId={user.id} />
                </div>
            </div>
        </div>
    )
}
