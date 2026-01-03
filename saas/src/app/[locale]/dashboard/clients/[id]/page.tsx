import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, FileText, Activity } from "lucide-react"

export default async function ClientProfilePage({
    params
}: {
    params: Promise<{ id: string; locale: string }>
}) {
    const { id } = await params
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

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-white">
                            {client.first_name} {client.last_name}
                        </h1>
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/5">
                            {client.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1.5 italic">
                            <Mail size={14} />
                            <span>{client.email || "No email provided"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>Joined {new Date(client.created_at!).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="summary" className="space-y-6">
                <TabsList className="bg-slate-900 border-slate-800">
                    <TabsTrigger value="summary" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                        Résumé
                    </TabsTrigger>
                    <TabsTrigger value="program" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                        Programme
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                        Historique
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-slate-900 border-slate-800 text-white">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                    <Activity size={16} className="text-indigo-400" />
                                    Last Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">No activity yet</p>
                                <p className="text-xs text-slate-500 mt-1 italic">Waiting for mobile sync</p>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 bg-slate-900 border-slate-800 text-white">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                    <FileText size={16} className="text-indigo-400" />
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-300">
                                    {client.notes || "No notes available for this client."}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="program">
                    <div className="p-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-center">
                        <p className="text-slate-500">Program Builder coming in Phase 5</p>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="p-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-center">
                        <p className="text-slate-500">Sync History coming in Phase 4</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
