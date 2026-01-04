import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, FileText, Activity, Settings } from "lucide-react"
import { RecentActivity } from "@/components/clients/activity/recent-activity"
import { AssignProgramModal } from "@/components/clients/assign-program-modal"
import { ClientAnalytics } from "@/components/clients/client-analytics"

export default async function ClientProfilePage({
    params
}: {
    params: Promise<{ id: string; locale: string }>
}) {
    const { id, locale } = await params
    const supabase = await createClient()
    const t = await getTranslations("Clients")

    const { data: client, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !client) {
        notFound()
    }

    // Fetch programs for the modal
    const { data: programs } = await supabase
        .from("coach_programs")
        .select("id, name")
        .eq("is_template", true)

    // Fetch recent activity for summary/history
    const { data: activities } = await supabase
        .from("synced_data")
        .select("*")
        .eq("client_id", id)
        .order("performed_at", { ascending: false })
        .limit(5)

    // Fetch all workout activities for analytics (last 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: analyticsActivities } = await supabase
        .from("synced_data")
        .select("*")
        .eq("client_id", id)
        .eq("data_type", "workout")
        .gte("performed_at", ninetyDaysAgo.toISOString())
        .order("performed_at", { ascending: true })

    const activitiesT = await getTranslations("Activities")
    const lastSync = activities?.[0]

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            {client.first_name} {client.last_name}
                        </h1>
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/5 px-2 py-1">
                            {t(`status.${client.status}`)}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-slate-400">
                        <div className="flex items-center gap-2">
                            <Mail size={16} />
                            <span>{client.email || t("profile.noEmail")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{t("profile.joined", { date: new Date(client.created_at!).toLocaleDateString(locale) })}</span>
                        </div>
                    </div>
                </div>

                <AssignProgramModal clientId={id} programs={programs || []} />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="summary" className="space-y-10">
                <TabsList className="bg-slate-900 border-slate-800 p-1 h-auto rounded-2xl">
                    <TabsTrigger value="summary" className="px-8 py-3 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-black uppercase text-[10px] tracking-widest">
                        {t("tabs.summary")}
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="px-8 py-3 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-black uppercase text-[10px] tracking-widest">
                        {t("tabs.analytics")}
                    </TabsTrigger>
                    <TabsTrigger value="program" className="px-8 py-3 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-black uppercase text-[10px] tracking-widest">
                        {t("tabs.program")}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="px-8 py-3 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-black uppercase text-[10px] tracking-widest">
                        {t("tabs.history")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-indigo-500/10">
                            <CardHeader className="bg-slate-950/50 border-b border-slate-800">
                                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity size={14} className="text-indigo-500" />
                                    {t("profile.lastActivity")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                {lastSync ? (
                                    <>
                                        <p className="text-3xl font-black text-white uppercase tracking-tighter italic truncate">
                                            {activitiesT.has(lastSync.data_type) ? activitiesT(lastSync.data_type) : lastSync.data_type.replace("_", " ")}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-2 font-medium">
                                            {t("profile.synced", { date: new Date(lastSync.updated_at!).toLocaleDateString(locale) })}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-3xl font-black text-white uppercase tracking-tighter italic">{t("profile.noActivity")}</p>
                                        <p className="text-xs text-slate-500 mt-2 font-medium">{t("profile.waitingSync")}</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 bg-slate-900 border-slate-800 text-white rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-indigo-500/10">
                            <CardHeader className="bg-slate-950/50 border-b border-slate-800">
                                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <FileText size={14} className="text-indigo-500" />
                                    {t("profile.notes")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <p className="text-lg font-medium text-slate-300 leading-relaxed italic">
                                    {client.notes || t("profile.noNotes")}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden group">
                            <CardHeader className="bg-slate-950/50">
                                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                    <Settings size={16} className="text-indigo-400" />
                                    {t("profile.syncConfiguration")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("profile.tokenLabel")}</p>
                                    <p className="font-mono text-indigo-400 break-all select-all">{client.sync_token || "N/A"}</p>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed italic">
                                    {t("profile.syncInstructions")}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="md:col-span-3 space-y-4">
                            <h3 className="text-lg font-bold text-white">{t("profile.recentActivity")}</h3>
                            <RecentActivity activities={activities || []} locale={locale} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <ClientAnalytics activities={analyticsActivities || []} locale={locale} />
                </TabsContent>

                <TabsContent value="program">
                    <div className="p-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-center">
                        <p className="text-slate-500">{t("profile.programComing")}</p>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white">{t("profile.historyDetailed")}</h3>
                        <RecentActivity activities={activities || []} locale={locale} />
                        {activities && activities.length > 5 && (
                            <p className="text-center text-slate-500 text-sm italic">{t("profile.paginationComingSoon")}</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
