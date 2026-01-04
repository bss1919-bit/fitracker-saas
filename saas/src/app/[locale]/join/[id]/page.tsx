import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Smartphone, Download, CheckCircle2 } from "lucide-react"
import Image from "next/image"

export default async function JoinPage({
    params
}: {
    params: Promise<{ id: string; locale: string }>
}) {
    const { id } = await params
    const t = await getTranslations("Join")
    const supabase = await createClient()

    // Fetch coach info
    const { data: coach, error } = await supabase
        .from("coaches")
        .select("full_name, business_name, logo_url")
        .eq("id", id)
        .single()

    if (error || !coach) {
        notFound()
    }

    const coachName = coach.business_name || coach.full_name || t("fallbackName")

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
            <div className="max-w-md w-full space-y-8 text-center">
                {coach.logo_url && (
                    <div className="relative w-24 h-24 mx-auto rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-900">
                        <Image
                            src={coach.logo_url}
                            alt={coachName}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                <header className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-white">{t("title")}</h1>
                    <p className="text-slate-400 text-lg">
                        {t("description", { name: coachName })}
                    </p>
                </header>

                <Card className="bg-slate-900 border-slate-800 text-start border-2 border-indigo-500/10 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-slate-950/30 border-b border-slate-800 p-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                            <Smartphone className="text-indigo-400" size={20} />
                            {t("howTo")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-sm text-indigo-400">1</div>
                            <div className="space-y-1 text-start">
                                <p className="font-medium text-white">{t("step1")}</p>
                                <p className="text-sm text-slate-500">{t("step1Desc")}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-sm text-indigo-400">2</div>
                            <div className="space-y-1 text-start">
                                <p className="font-medium text-white">{t("step2")}</p>
                                <p className="text-sm text-slate-500">{t("step2Desc")}</p>
                            </div>
                        </div>

                        <div className="pt-4 space-y-4 border-t border-slate-800">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-bold rounded-xl group shadow-lg shadow-indigo-500/10 transition-all hover:scale-[1.02]">
                                <Download className="me-2 group-hover:translate-y-0.5 transition-transform" size={18} />
                                {t("download")}
                            </Button>
                            <p className="text-xs text-center text-slate-500 tracking-wide uppercase font-semibold">{t("deepLink")}</p>
                        </div>
                    </CardContent>
                </Card>

                <footer className="pt-8 flex flex-col items-center space-y-6">
                    <div className="font-black text-2xl tracking-tight text-white/50">
                        FitTracker <span className="text-indigo-500/50">Pro</span>
                    </div>
                    <div className="flex gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500/50" />
                        <span className="text-xs text-slate-600 italic">{t("footer")}</span>
                    </div>
                </footer>
            </div>
        </div>
    )
}
