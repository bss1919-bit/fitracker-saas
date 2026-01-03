"use client"

import { QRCodeSVG } from "qrcode.react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface QRInvitationProps {
    coachId: string
}

export function QRInvitation({ coachId }: QRInvitationProps) {
    const t = useTranslations("Clients")
    const [copied, setCopied] = useState(false)

    // The magic link that redirects to mobile app or landing page
    const invitationUrl = `${window.location.protocol}//${window.location.host}/join/${coachId}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(invitationUrl)
        setCopied(true)
        toast.success("Link copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
            <CardHeader className="text-center">
                <CardTitle>Invite Athletes</CardTitle>
                <CardDescription className="text-slate-400">
                    Share your professional invitation QR code or link
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
                <div className="p-4 bg-white rounded-xl shadow-xl shadow-indigo-500/10">
                    <QRCodeSVG
                        value={invitationUrl}
                        size={180}
                        level="H"
                        includeMargin={false}
                        imageSettings={{
                            src: "/logo.png", // Assuming a logo exists or we can skip
                            x: undefined,
                            y: undefined,
                            height: 24,
                            width: 24,
                            excavate: true,
                        }}
                    />
                </div>

                <div className="w-full flex gap-2">
                    <div className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md truncate text-sm text-slate-400 select-all">
                        {invitationUrl}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 border-slate-800 hover:bg-slate-800 text-slate-400"
                        onClick={copyToClipboard}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
