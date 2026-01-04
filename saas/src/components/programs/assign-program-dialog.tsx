"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Calendar as CalendarIcon, Loader2, Check } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface AssignProgramDialogProps {
    programId: string
    programName: string
}

export function AssignProgramDialog({ programId, programName }: AssignProgramDialogProps) {
    const t = useTranslations("Programs")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<any[]>([])
    const [selectedClientId, setSelectedClientId] = useState<string>("")
    const [startDate, setStartDate] = useState<Date>(new Date())
    const supabase = createClient()

    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase
                .from("clients")
                .select("id, first_name, last_name")
                .eq("status", "active")

            if (data) setClients(data)
        }
        if (open) fetchClients()
    }, [open])

    const handleAssign = async () => {
        if (!selectedClientId) {
            toast.error(t("assign.selectClientError"))
            return
        }

        try {
            setLoading(true)
            const { error } = await supabase
                .from("program_assignments")
                .insert({
                    program_id: programId,
                    client_id: selectedClientId,
                    start_date: format(startDate, "yyyy-MM-dd"),
                    status: "active"
                })

            if (error) throw error

            toast.success(t("assign.success"))
            setOpen(false)
        } catch (error) {
            console.error(error)
            toast.error(t("assign.error"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10">
                    {t("assign.button")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>{t("assign.title")}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {t("assign.description", { name: programName })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">{t("assign.selectAthlete")}</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between bg-slate-950 border-slate-800",
                                        !selectedClientId && "text-muted-foreground"
                                    )}
                                >
                                    {selectedClientId
                                        ? clients.find((c) => c.id === selectedClientId)?.first_name + " " + (clients.find((c) => c.id === selectedClientId)?.last_name || "")
                                        : t("assign.selectClientPlaceholder")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 bg-slate-900 border-slate-800" align="start">
                                <Command className="bg-slate-900">
                                    <CommandInput placeholder={t("assign.searchClient")} className="text-white" />
                                    <CommandList>
                                        <CommandEmpty>{t("assign.noClientFound")}</CommandEmpty>
                                        <CommandGroup>
                                            {clients.map((client) => (
                                                <CommandItem
                                                    key={client.id}
                                                    value={client.id}
                                                    onSelect={(currentValue) => {
                                                        setSelectedClientId(currentValue === selectedClientId ? "" : currentValue)
                                                    }}
                                                    className="text-white hover:bg-slate-800 cursor-pointer"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedClientId === client.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {client.first_name} {client.last_name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-medium text-slate-300">{t("assign.startDate")}</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-slate-950 border-slate-800",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : <span>{t("assign.pickDate")}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => date && setStartDate(date)}
                                    initialFocus
                                    className="bg-slate-900 text-white"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleAssign}
                        disabled={loading || !selectedClientId}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                        {t("assign.confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
