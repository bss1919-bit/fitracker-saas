import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { Users, GraduationCap, TrendingUp, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default async function AdminDashboard() {
    const t = await getTranslations("Admin")
    const supabase = await createClient()

    // Stats
    const { count: coachesCount } = await supabase
        .from("coaches")
        .select("*", { count: "exact", head: true })

    const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })

    // Recent Coaches
    const { data: recentCoaches } = await supabase
        .from("coaches")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

    const stats = [
        { label: t("coachesCount"), value: coachesCount || 0, icon: GraduationCap, color: "text-amber-400" },
        { label: t("clientsCount"), value: clientsCount || 0, icon: Users, color: "text-blue-400" },
        { label: "Active Subs", value: 0, icon: TrendingUp, color: "text-emerald-400" },
    ]

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <header>
                <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
                <p className="text-slate-400 mt-2">Managing the FitTracker platform ecosystem</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <h2 className="text-xl font-bold text-white">{t("coachesList")}</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            placeholder="Search coaches..."
                            className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                        />
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-950">
                            <TableRow className="border-slate-800">
                                <TableHead className="text-slate-400">{t("table.coach")}</TableHead>
                                <TableHead className="text-slate-400">{t("table.email")}</TableHead>
                                <TableHead className="text-slate-400">{t("table.status")}</TableHead>
                                <TableHead className="text-slate-400">{t("table.joined")}</TableHead>
                                <TableHead className="text-right text-slate-400">{t("table.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentCoaches?.map((coach) => (
                                <TableRow key={coach.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                                    <TableCell className="font-medium text-white">
                                        {coach.business_name || coach.full_name || "New Coach"}
                                    </TableCell>
                                    <TableCell className="text-slate-400">{coach.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/5 capitalize">
                                            {coach.subscription_tier}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {new Date(coach.created_at!).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <button className="text-xs font-bold text-indigo-400 hover:underline">
                                            Manage
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
