"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
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
import { assignProgram } from "@/app/[locale]/dashboard/clients/actions"
import { toast } from "sonner"
import { GraduationCap, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr, enUS, ar } from "date-fns/locale"

interface AssignProgramModalProps {
    clientId: string
    programs: { id: string, name: any }[]
}

export function AssignProgramModal({ clientId, programs }: AssignProgramModalProps) {
    const t = useTranslations("Clients.assign")
    const locale = useLocale()
    const dateLocale = locale === 'fr' ? fr : locale === 'ar' ? ar : enUS
    const [open, setOpen] = useState(false)
    const [selectedProgram, setSelectedProgram] = useState<string>("")
    const [startDate, setStartDate] = useState<Date>(new Date())
    const [loading, setLoading] = useState(false)

    const handleAssign = async () => {
        if (!selectedProgram) {
            toast.error(t("selectProgramError"))
            return
        }

        try {
            setLoading(true)
            await assignProgram(clientId, selectedProgram, startDate.toISOString().split('T')[0])
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
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-bold h-10 px-4 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                    <GraduationCap size={18} />
                    {t("trigger")}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <GraduationCap className="text-indigo-500" size={28} />
                        {t("title")}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 space-y-8">
                    <div className="space-y-3">
                        <Label className={cn(
                            "text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1",
                            locale === 'ar' && "tracking-normal"
                        )}>
                            {t("selectProgram")}
                        </Label>
                        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                            <SelectTrigger className="bg-slate-950 border-slate-800 h-14 rounded-2xl text-white font-bold px-4 focus:ring-indigo-500/20 shadow-inner">
                                <SelectValue placeholder={t("placeholder")} />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 rounded-2xl p-2 shadow-2xl">
                                {programs.map((p) => (
                                    <SelectItem key={p.id} value={p.id} className="text-white hover:bg-slate-800 focus:bg-slate-800 rounded-xl py-3 font-bold">
                                        {p.name.default || p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className={cn(
                            "text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1",
                            locale === 'ar' && "tracking-normal"
                        )}>
                            {t("startDate")}
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full h-14 bg-slate-950 border-slate-800 rounded-2xl justify-start px-4 font-bold text-white hover:bg-slate-900 transition-all shadow-inner"
                                >
                                    <CalendarIcon className="me-3 text-indigo-500" size={20} />
                                    {startDate ? format(startDate, "PPP", { locale: dateLocale }) : <span>{t("pickDate")}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-2xl" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => date && setStartDate(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="flex-1 h-14 rounded-2xl text-slate-500 hover:text-white hover:bg-slate-800 font-black uppercase tracking-widest text-[10px] transition-all"
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={loading || !selectedProgram}
                            className={cn(
                                "flex-1 h-14 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]",
                                locale === 'ar' && "tracking-normal"
                            )}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : t("submit")}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
