"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { assignProgram } from "@/app/[locale]/dashboard/clients/actions"
import { toast } from "sonner"
import { GraduationCap, Calendar, Loader2 } from "lucide-react"

interface AssignProgramModalProps {
    clientId: string
    programs: { id: string, name: any }[]
}

export function AssignProgramModal({ clientId, programs }: AssignProgramModalProps) {
    const t = useTranslations("Clients.assign")
    const [open, setOpen] = useState(false)
    const [selectedProgram, setSelectedProgram] = useState<string>("")
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)

    const handleAssign = async () => {
        if (!selectedProgram) {
            toast.error(t("selectProgramError"))
            return
        }

        try {
            setLoading(true)
            await assignProgram(clientId, selectedProgram, startDate)
            toast.success(t("success"))
            setOpen(false)
        } catch (error) {
            console.error(error)
            toast.error(t("error"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
                    <GraduationCap size={18} />
                    {t("trigger")}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                        {t("title")}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            {t("selectProgram")}
                        </Label>
                        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                            <SelectTrigger className="bg-slate-950 border-slate-800 h-12 rounded-xl">
                                <SelectValue placeholder={t("placeholder")} />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800">
                                {programs.map((p) => (
                                    <SelectItem key={p.id} value={p.id} className="text-white hover:bg-slate-800">
                                        {p.name.default || p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            {t("startDate")}
                        </Label>
                        <div className="relative">
                            <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-slate-950 border-slate-800 h-12 ps-10 rounded-xl"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="flex-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={loading}
                        className="flex-1 bg-white text-slate-950 hover:bg-slate-200 rounded-xl font-black uppercase tracking-widest text-xs"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : t("submit")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
