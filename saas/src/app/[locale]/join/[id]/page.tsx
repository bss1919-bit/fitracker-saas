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

    const coachName = coach.business_name || coach.full_name || "a professional coach"

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

                <header className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">You've been invited!</h1>
                    <p className="text-slate-400">
                        Join <strong>{coachName}</strong> on FitTracker Pro to start your training journey.
                    </p>
                </header>

                <Card className="bg-slate-900 border-slate-800 text-left border-2 border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Smartphone className="text-indigo-400" size={20} />
                            How to join
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm">1</div>
                            <div className="space-y-1">
                                <p className="font-medium">Download the mobile app</p>
                                <p className="text-sm text-slate-500">Available on iOS and Android</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm">2</div>
                            <div className="space-y-1">
                                <p className="font-medium">Open the app & Scan the QR</p>
                                <p className="text-sm text-slate-500">Or use the link provided by your coach</p>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-semibold group">
                                <Download className="mr-2 group-hover:translate-y-0.5 transition-transform" size={20} />
                                Download App
                            </Button>
                            <p className="text-[10px] text-center text-slate-600 uppercase tracking-widest font-bold">Deep link will be active soon</p>
                        </div>
                    </CardContent>
                </Card>

                <footer className="pt-8 flex flex-col items-center space-y-4">
                    <div className="flex gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-xs text-slate-500 italic">Powering professional coaching worldwide</span>
                    </div>
                </footer>
            </div>
        </div>
    )
}
