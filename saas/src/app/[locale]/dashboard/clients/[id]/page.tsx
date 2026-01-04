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
import { cn } from "@/lib/utils"
import { Link } from "@/i18n/routing"

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

    // Fetch active program
    const { data: activeAssignment } = await supabase
        .from("program_assignments")
        .select(`
            *,
            coach_programs (
                name,
                description
            )
        `)
        .eq("client_id", id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .maybeSingle()

    const activitiesT = await getTranslations("Activities")
    const lastSync = activities?.[0]

    return (
        <div className="max-w-7xl mx-auto space-y-12">
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
            <Tabs defaultValue="summary" className="space-y-10" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <div className="overflow-x-auto scrollbar-none pb-2">
                    <TabsList className="bg-slate-900 border-slate-800 p-1.5 h-auto rounded-2xl inline-flex">
                        <TabsTrigger value="summary" className={cn(
                            "px-8 py-3 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-bold text-[10px] shrink-0",
                            locale !== 'ar' && "uppercase tracking-widest"
                        )}>
                            {t("tabs.summary")}
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className={cn(
                            "px-8 py-3 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-bold text-[10px] shrink-0",
                            locale !== 'ar' && "uppercase tracking-widest"
                        )}>
                            {t("tabs.analytics")}
                        </TabsTrigger>
                        <TabsTrigger value="program" className={cn(
                            "px-8 py-3 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-bold text-[10px] shrink-0",
                            locale !== 'ar' && "uppercase tracking-widest"
                        )}>
                            {t("tabs.program")}
                        </TabsTrigger>
                        <TabsTrigger value="history" className={cn(
                            "px-8 py-3 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-bold text-[10px] shrink-0",
                            locale !== 'ar' && "uppercase tracking-widest"
                        )}>
                            {t("tabs.history")}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="summary" className="space-y-8 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-indigo-500/10 transition-all hover:border-indigo-500/20">
                            <CardHeader className="bg-slate-950/50 border-b border-slate-800 p-6">
                                <CardTitle className="text-2xl font-black text-white flex items-center gap-3 leading-tight">
                                    <Activity size={24} className="text-indigo-500 shrink-0" />
                                    <span>{t("profile.lastActivity")}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                {lastSync ? (
                                    <>
                                        <p className={cn(
                                            "text-3xl font-bold text-white tracking-tighter truncate",
                                            locale !== 'ar' && "uppercase italic"
                                        )}>
                                            {activitiesT.has(lastSync.data_type) ? activitiesT(lastSync.data_type) : lastSync.data_type.replace("_", " ")}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-2 font-medium">
                                            {t("profile.synced", { date: new Date(lastSync.updated_at!).toLocaleDateString(locale) })}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className={cn(
                                            "text-3xl font-bold text-white tracking-tighter",
                                            locale !== 'ar' && "uppercase italic"
                                        )}>{t("profile.noActivity")}</p>
                                        <p className="text-xs text-slate-500 mt-2 font-medium">{t("profile.waitingSync")}</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 bg-slate-900 border-slate-800 text-white rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-indigo-500/10 transition-all hover:border-indigo-500/20">
                            <CardHeader className="bg-slate-950/50 border-b border-slate-800 p-6">
                                <CardTitle className="text-2xl font-black text-white flex items-center gap-3 leading-tight">
                                    <FileText size={24} className="text-indigo-500 shrink-0" />
                                    <span>{t("profile.notes")}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <p className={cn(
                                    "text-lg font-medium text-slate-300 leading-relaxed",
                                    locale !== 'ar' && "italic"
                                )}>
                                    {client.notes || t("profile.noNotes")}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-indigo-500/10 transition-all hover:border-indigo-500/20">
                            <CardHeader className="bg-slate-950/50 border-b border-slate-800 p-6">
                                <CardTitle className="text-2xl font-black text-white flex items-center gap-3 leading-tight">
                                    <Settings size={24} className="text-indigo-500 shrink-0" />
                                    <span>{t("profile.syncConfiguration")}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                                    <p className={cn(
                                        "text-[10px] font-bold text-slate-500",
                                        locale !== 'ar' && "uppercase tracking-widest"
                                    )}>{t("profile.tokenLabel")}</p>
                                    <p className="font-mono text-indigo-400 break-all select-all font-bold">{client.sync_token || "N/A"}</p>
                                </div>
                                <p className={cn(
                                    "text-xs text-slate-500 leading-relaxed",
                                    locale !== 'ar' && "italic"
                                )}>
                                    {t("profile.syncInstructions")}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="md:col-span-3 space-y-6 pt-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity size={24} className="text-indigo-500" />
                                {t("profile.recentActivity")}
                            </h3>
                            <RecentActivity activities={activities || []} locale={locale} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6 outline-none">
                    <ClientAnalytics activities={analyticsActivities || []} locale={locale} />
                </TabsContent>

                <TabsContent value="program" className="outline-none">
                    {activeAssignment ? (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Calendar size={20} className="text-indigo-500" />
                                    {t("tabs.program")}
                                </h3>
                                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1.5 rounded-full font-bold">
                                    {t("assign.startDate")}: {activeAssignment.start_date ? new Date(activeAssignment.start_date).toLocaleDateString(locale) : "-"}
                                </Badge>
                            </div>

                            <Card className="bg-slate-900 border-slate-800 text-white rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 border-2 border-indigo-500/10 group">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />
                                <CardHeader className="bg-slate-950/50 border-b border-slate-800 p-8">
                                    <CardTitle className="text-2xl font-black mb-2">
                                        {(activeAssignment.coach_programs as any)?.name?.default || (activeAssignment.coach_programs as any)?.name}
                                    </CardTitle>
                                    <p className="text-slate-400 text-lg">
                                        {(activeAssignment.coach_programs as any)?.description || t("profile.noDescription")}
                                    </p>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-2">
                                            <p className={cn(
                                                "text-[10px] font-bold text-slate-500",
                                                locale !== 'ar' && "uppercase tracking-widest"
                                            )}>{t("assign.status") || "Status"}</p>
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 capitalize font-bold">
                                                {activeAssignment.status}
                                            </Badge>
                                        </div>
                                        <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-2">
                                            <p className={cn(
                                                "text-[10px] font-bold text-slate-500",
                                                locale !== 'ar' && "uppercase tracking-widest"
                                            )}>{t("assign.assignedOn") || "Assigned On"}</p>
                                            <p className="text-white font-bold">{activeAssignment.created_at ? new Date(activeAssignment.created_at).toLocaleDateString(locale) : "-"}</p>
                                        </div>
                                        <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center justify-center">
                                            <Link
                                                href={`/dashboard/programs/${(activeAssignment.coach_programs as any)?.id}`}
                                                className={cn(
                                                    "text-indigo-400 font-bold hover:text-indigo-300 transition-colors text-[10px]",
                                                    locale !== 'ar' && "uppercase tracking-widest"
                                                )}
                                            >
                                                {t("assign.viewFullDetails") || "View Full Details"}
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="p-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-[2rem] text-center space-y-6 flex flex-col items-center shadow-2xl shadow-black/50 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                            <div className="p-6 bg-slate-950 rounded-full border border-slate-800 text-indigo-500 shadow-xl shadow-indigo-500/10">
                                <Calendar size={40} />
                            </div>
                            <div className="space-y-3 relative z-10">
                                <p className="text-3xl font-bold text-white tracking-tight">{t("profile.noProgramAssigned") || "No Program Assigned"}</p>
                                <p className="text-slate-400 max-w-sm mx-auto text-lg">{t("profile.noProgramAssignedDesc") || "Assign a program to help this athlete achieve their goals."}</p>
                            </div>
                            <div className="relative z-10 pt-4">
                                <AssignProgramModal clientId={id} programs={programs || []} />
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-8 outline-none">
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity size={24} className="text-indigo-500" />
                            {t("profile.historyDetailed")}
                        </h3>
                        <RecentActivity activities={activities || []} locale={locale} />
                        {activities && activities.length >= 5 && (
                            <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-2xl text-center">
                                <p className="text-slate-500 text-sm italic">{t("profile.paginationComingSoon")}</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
