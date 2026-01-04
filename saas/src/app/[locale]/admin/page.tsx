import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { Users, GraduationCap, TrendingUp, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { impersonateCoach, updateCoachStatus } from "./actions"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Admin")
    return {
        title: `${t("title")} | Admin`,
    }
}

export default async function AdminDashboard({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
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
        { label: t("activeSubs"), value: 0, icon: TrendingUp, color: "text-emerald-400" },
    ]

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
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
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            placeholder={t("searchPlaceholder")}
                            className="ps-10 pe-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
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
                                <TableHead className="text-end text-slate-400">{t("table.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentCoaches?.map((coach) => (
                                <TableRow key={coach.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                                    <TableCell className="font-medium text-white">
                                        {coach.business_name || coach.full_name || t("newCoach")}
                                    </TableCell>
                                    <TableCell className="text-slate-400">{coach.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="border-indigo-500/50 text-indigo-400 bg-indigo-500/5 capitalize">
                                                {coach.subscription_tier}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "capitalize",
                                                    coach.status === 'active' ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/5" :
                                                        coach.status === 'suspended' ? "border-amber-500/50 text-amber-500 bg-amber-500/5" :
                                                            "border-red-500/50 text-red-500 bg-red-500/5"
                                                )}
                                            >
                                                {coach.status || 'active'}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {new Date(coach.created_at!).toLocaleDateString(locale)}
                                    </TableCell>
                                    <TableCell className="text-end">
                                        <div className="flex justify-end gap-2">
                                            <form action={async () => {
                                                "use server"
                                                await impersonateCoach(coach.id, locale)
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="px-3 py-1 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-400 hover:text-white rounded-lg text-xs font-black transition-all"
                                                >
                                                    {t("table.impersonate")}
                                                </button>
                                            </form>

                                            {coach.status !== 'active' && (
                                                <form action={async () => {
                                                    "use server"
                                                    await updateCoachStatus(coach.id, 'active')
                                                }}>
                                                    <button type="submit" className="px-3 py-1 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white rounded-lg text-xs font-black transition-all">
                                                        {t("table.activate")}
                                                    </button>
                                                </form>
                                            )}

                                            {coach.status === 'active' && (
                                                <form action={async () => {
                                                    "use server"
                                                    await updateCoachStatus(coach.id, 'suspended')
                                                }}>
                                                    <button type="submit" className="px-3 py-1 bg-amber-600/10 hover:bg-amber-600 border border-amber-500/30 text-amber-400 hover:text-white rounded-lg text-xs font-black transition-all">
                                                        {t("table.suspend")}
                                                    </button>
                                                </form>
                                            )}

                                            {coach.status !== 'banned' && (
                                                <form action={async () => {
                                                    "use server"
                                                    await updateCoachStatus(coach.id, 'banned')
                                                }}>
                                                    <button type="submit" className="px-3 py-1 bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white rounded-lg text-xs font-black transition-all">
                                                        {t("table.ban")}
                                                    </button>
                                                </form>
                                            )}
                                        </div>
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
