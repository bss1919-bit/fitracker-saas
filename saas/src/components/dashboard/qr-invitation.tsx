"use client"

import { QRCodeSVG } from "qrcode.react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface QRInvitationProps {
    coachId: string
}

export function QRInvitation({ coachId }: QRInvitationProps) {
    const t = useTranslations("Clients")
    const [copied, setCopied] = useState(false)
    const [invitationUrl, setInvitationUrl] = useState("")

    useEffect(() => {
        // Construct the URL only on the client side
        setInvitationUrl(`${window.location.protocol}//${window.location.host}/join/${coachId}`)
    }, [coachId])

    const copyToClipboard = () => {
        if (!invitationUrl) return;
        navigator.clipboard.writeText(invitationUrl)
        setCopied(true)
        toast.success(t("invite.copySuccess"))
        setTimeout(() => setCopied(false), 2000)
    }

    if (!invitationUrl) return null;

    return (
        <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-indigo-500/10">
            <CardHeader className="bg-slate-950/50 border-b border-slate-800 p-6">
                <CardTitle className="text-2xl font-black text-white flex items-center gap-3 leading-tight">
                    <Copy size={24} className="text-indigo-400" />
                    {t("invite.title")}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-8 p-8">
                <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-indigo-500/20">
                    <QRCodeSVG
                        value={invitationUrl}
                        size={160}
                        level="H"
                        includeMargin={false}
                    />
                </div>

                <div className="w-full space-y-4">
                    <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
                        {t("invite.description")}
                    </p>
                    <div className="flex gap-2">
                        <div className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl truncate text-xs font-mono text-indigo-400 select-all flex items-center">
                            {invitationUrl}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 h-11 w-11 rounded-xl border-slate-800 hover:bg-slate-800 text-indigo-400"
                            onClick={copyToClipboard}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
