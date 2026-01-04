"use client"

import { useState, useEffect, useRef } from "react"
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { QrCode, X, Camera, RefreshCw } from "lucide-react"
import CryptoJS from "crypto-js"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function LinkClientDialog() {
    const t = useTranslations("Clients")
    const router = useRouter()
    const supabase = createClient()
    const [open, setOpen] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [scannedData, setScannedData] = useState<any>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const scannerRef = useRef<Html5Qrcode | null>(null)

    const ENCRYPTION_KEY = 'FitTrackerPro_SecureKey_2024_v2.0';

    useEffect(() => {
        if (!open) {
            stopScanner()
            setScannedData(null)
            setScanning(false)
        }
    }, [open])

    const startScanner = async () => {
        setScanning(true)
        setScannedData(null)

        // Wait for the DOM element to be available
        setTimeout(async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader")
                scannerRef.current = html5QrCode

                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        handleScan(decodedText)
                        void html5QrCode.stop()
                    },
                    (errorMessage) => {
                        // ignore errors
                    }
                )
            } catch (err) {
                console.error("Error starting scanner:", err)
                toast.error(t("errorCamera"))
                setScanning(false)
            }
        }, 100)
    }

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop()
            } catch (err) {
                console.error("Error stopping scanner:", err)
            }
        }
    }

    const handleScan = (data: string) => {
        try {
            // Decrypt
            const bytes = CryptoJS.AES.decrypt(data, ENCRYPTION_KEY)
            const decryptedDataString = bytes.toString(CryptoJS.enc.Utf8)

            if (!decryptedDataString) {
                throw new Error("Invalid encryption or key")
            }

            const clientData = JSON.parse(decryptedDataString)

            if (clientData.type !== 'fitracker-user-v2') {
                toast.error(t("errorInvalidQrType"))
                return
            }

            setScannedData(clientData)
            setScanning(false)
        } catch (err) {
            console.error("Decryption error:", err)
            toast.error(t("errorInvalidQr"))
            void startScanner() // Try again
        }
    }

    const confirmLink = async () => {
        if (!scannedData) return

        setIsProcessing(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            // Extract names - if name contains space, split it
            const names = scannedData.name ? scannedData.name.split(' ') : ['Client']
            const firstName = names[0]
            const lastName = names.length > 1 ? names.slice(1).join(' ') : ""

            const profileData = {
                age: scannedData.age,
                gender: scannedData.gender,
                height: scannedData.height,
                weight: scannedData.weight,
                goal: scannedData.goal,
                activityLevel: scannedData.activityLevel,
                trainingDays: scannedData.trainingDays,
                firstTrainingDayOfWeek: scannedData.firstTrainingDayOfWeek,
                timestamp: scannedData.timestamp
            }

            // Upsert client
            const { error } = await supabase
                .from("clients")
                .upsert({
                    id: scannedData.qrCodeId,
                    coach_id: user.id,
                    first_name: firstName,
                    last_name: lastName || null,
                    status: "active",
                    profile_data: profileData
                })

            if (error) throw error

            toast.success(t("form.createSuccess"))
            setOpen(false)
            router.refresh()
        } catch (err) {
            console.error("Error linking client:", err)
            toast.error(t("errorLink"))
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-900 border border-slate-800 text-white font-bold h-10 px-4 rounded-xl shadow-lg transition-all hover:bg-slate-800 hover:scale-[1.02]">
                    <QrCode size={18} className="me-2" />
                    {t("linkClient")}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>{t("linkClientTitle")}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {t("linkClientDesc")}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center justify-center min-h-[300px]">
                    {!scanning && !scannedData && (
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/10">
                                <Camera size={48} className="text-indigo-400" />
                            </div>
                            <Button
                                onClick={startScanner}
                                className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
                            >
                                {t("openCamera")}
                            </Button>
                        </div>
                    )}

                    {scanning && (
                        <div className="w-full space-y-4">
                            <div id="reader" className="overflow-hidden rounded-2xl border-2 border-indigo-500/20 bg-black aspect-square"></div>
                            <Button
                                variant="outline"
                                onClick={() => { stopScanner(); setScanning(false) }}
                                className="w-full border-slate-800 hover:bg-slate-800"
                            >
                                <X size={16} className="me-2" />
                                {t("cancel")}
                            </Button>
                        </div>
                    )}

                    {scannedData && (
                        <div className="w-full space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-xl">
                                        {scannedData.name?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{scannedData.name}</h4>
                                        <p className="text-xs text-slate-500 font-mono">{scannedData.qrCodeId}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-900 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">{t("ageGender")}</p>
                                        <p className="font-bold">{scannedData.age} / {scannedData.gender}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">{t("weightHeight")}</p>
                                        <p className="font-bold">{scannedData.weight}kg / {scannedData.height}cm</p>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">{t("goal")}</p>
                                        <p className="font-bold text-indigo-400">{scannedData.goal}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => { setScannedData(null); startScanner() }}
                                    className="flex-1 border-slate-800 hover:bg-slate-800 h-12 rounded-xl"
                                    disabled={isProcessing}
                                >
                                    <RefreshCw size={16} className="me-2" />
                                    {t("rescan")}
                                </Button>
                                <Button
                                    onClick={confirmLink}
                                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "..." : t("confirmLink")}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
