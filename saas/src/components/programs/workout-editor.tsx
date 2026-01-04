"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
    Plus,
    Trash2,
    Save,
    Loader2,
    Copy,
    Layers,
    Calendar,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database } from "@/types/supabase"
import { toast } from "sonner"
import { useRouter } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// --- Types ---

type PlannedExercise = {
    id: string // local UI id
    exerciseId: string | number
    exerciseName: string
    sets: number
    reps: string | number | number[]
    rest: number
    supersetId?: string
    notes?: string
    categoryFilter?: string
    hasVariableReps?: boolean
}

type WorkoutDay = {
    id: string
    name: string
    exercises: PlannedExercise[]
}

type Cycle = {
    id: string
    name: string
    repeatCount: number
    days: WorkoutDay[]
}

interface WorkoutEditorProps {
    initialData?: any
    exercises: Database["public"]["Tables"]["coach_exercises"]["Row"][]
}

export function WorkoutEditor({ initialData, exercises }: WorkoutEditorProps) {
    const t = useTranslations("Programs")
    const [mounted, setMounted] = useState(false)
    const [programName, setProgramName] = useState(initialData?.name?.default || "")
    const [frequency, setFrequency] = useState(initialData?.structure?.frequency || 4)
    const [loading, setLoading] = useState(false)
    const [activeSupersetId, setActiveSupersetId] = useState<string | null>(null)

    const [cycles, setCycles] = useState<Cycle[]>(() => {
        const rawCycles = initialData?.structure?.cycles
        if (!rawCycles || rawCycles.length === 0) {
            return [
                {
                    id: "default-cycle",
                    name: "Cycle 1",
                    repeatCount: 1,
                    days: [
                        { id: "default-day", name: "Day 1", exercises: [] }
                    ]
                }
            ]
        }
        // Migration helper
        return rawCycles.map((c: any) => ({
            ...c,
            days: c.days || c.sessions || [],
            sessions: undefined
        }))
    })

    const [activeCycleId, setActiveCycleId] = useState<string>(
        (cycles[0]?.id) || "default-cycle"
    )
    const [activeDayId, setActiveDayId] = useState<string>(
        (cycles[0]?.days[0]?.id) || "default-day"
    )

    const duration = Math.ceil(
        cycles.reduce((acc, c) => acc + (c.days.length * c.repeatCount), 0) / (frequency || 1)
    )

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        setMounted(true)
    }, [])

    // --- Helpers ---

    const addCycle = () => {
        const newCycle: Cycle = {
            id: crypto.randomUUID(),
            name: `Cycle ${cycles.length + 1}`,
            repeatCount: 1,
            days: [{ id: crypto.randomUUID(), name: "Day 1", exercises: [] }]
        }
        setCycles([...cycles, newCycle])
        setActiveCycleId(newCycle.id)
        setActiveDayId(newCycle.days[0].id)
    }

    const deleteCycle = (id: string) => {
        if (cycles.length <= 1) return
        const newCycles = cycles.filter(c => c.id !== id)
        setCycles(newCycles)
        if (activeCycleId === id) {
            setActiveCycleId(newCycles[0].id)
            if (newCycles[0].days.length > 0) setActiveDayId(newCycles[0].days[0].id)
        }
    }

    const addDay = (cycleId: string) => {
        const cycle = cycles.find(c => c.id === cycleId)
        if (cycle && cycle.days.length >= frequency) {
            toast.error(t("limitReached", { count: frequency }))
            return
        }
        const newDay: WorkoutDay = {
            id: crypto.randomUUID(),
            name: `${t("session")} ${cycle ? cycle.days.length + 1 : 1}`,
            exercises: []
        }
        setCycles(cycles.map(c => c.id === cycleId ? { ...c, days: [...c.days, newDay] } : c))
        setActiveDayId(newDay.id)
    }

    const copyDay = (cycleId: string, dayToCopy: WorkoutDay) => {
        const cycle = cycles.find(c => c.id === cycleId)
        if (cycle && cycle.days.length >= frequency) {
            toast.error(t("limitReached", { count: frequency }))
            return
        }
        const newDay: WorkoutDay = {
            ...JSON.parse(JSON.stringify(dayToCopy)),
            id: crypto.randomUUID(),
            name: `${dayToCopy.name} ${t("copySuffix")}`,
            exercises: dayToCopy.exercises.map(e => ({ ...e, id: crypto.randomUUID() }))
        }
        setCycles(cycles.map(c => c.id === cycleId ? { ...c, days: [...c.days, newDay] } : c))
        setActiveDayId(newDay.id)
    }

    const addExercise = (cycleId: string, dayId: string, exercise: any) => {
        const newEx: PlannedExercise = {
            id: crypto.randomUUID(),
            exerciseId: exercise.id,
            exerciseName: exercise.name.default || exercise.name,
            sets: 3,
            reps: 12,
            rest: 60,
            supersetId: activeSupersetId || undefined,
            categoryFilter: exercise.category
        }
        updateDay(cycleId, dayId, (d) => ({ ...d, exercises: [...d.exercises, newEx] }))
    }

    const deleteExercise = (cycleId: string, dayId: string, exId: string) => {
        updateDay(cycleId, dayId, (d) => ({ ...d, exercises: d.exercises.filter(e => e.id !== exId) }))
    }

    const updateExercise = (cycleId: string, dayId: string, exId: string, updates: Partial<PlannedExercise>) => {
        updateDay(cycleId, dayId, (d) => ({
            ...d,
            exercises: d.exercises.map(e => e.id === exId ? { ...e, ...updates } : e)
        }))
    }

    const updateDay = (cycleId: string, dayId: string, updater: (d: WorkoutDay) => WorkoutDay) => {
        setCycles(cycles.map(c => {
            if (c.id === cycleId) {
                return {
                    ...c,
                    days: c.days.map(d => d.id === dayId ? updater(d) : d)
                }
            }
            return c
        }))
    }

    const saveProgram = async () => {
        if (!programName) {
            toast.error(t("enterName"))
            return
        }

        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Unauthorized")

            const processedCycles = cycles.map(cycle => ({
                ...cycle,
                days: cycle.days.map(day => ({
                    ...day,
                    exercises: day.exercises.map(ex => {
                        let processedReps: any = ex.reps
                        if (typeof ex.reps === 'string') {
                            if (ex.reps.includes(',')) {
                                processedReps = ex.reps.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r))
                            } else {
                                processedReps = parseInt(ex.reps) || 0
                            }
                        }
                        return {
                            ...ex,
                            reps: processedReps,
                            hasVariableReps: Array.isArray(processedReps)
                        }
                    })
                }))
            }))

            const { error } = await supabase
                .from("coach_programs")
                .upsert({
                    id: initialData?.id,
                    coach_id: user.id,
                    name: { default: programName },
                    duration,
                    structure: {
                        cycles: processedCycles,
                        frequency
                    },
                    is_template: true
                })

            if (error) throw error

            toast.success(t("createSuccess"))
            router.push("/dashboard/programs")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error(t("createError"))
        } finally {
            setLoading(false)
        }
    }

    const activeCycle = cycles.find(c => c.id === activeCycleId)

    if (!mounted) return <div className="p-8 text-slate-500 animate-pulse">{t("loading")}</div>

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Save Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl sticky top-4 z-50 backdrop-blur-md bg-opacity-90">
                <div className="flex-1 w-full md:w-auto flex items-center gap-4">
                    <div className="flex-1">
                        <Input
                            value={programName}
                            onChange={(e) => setProgramName(e.target.value)}
                            placeholder={t("programName")}
                            className="text-2xl font-black bg-transparent border-none focus-visible:ring-0 p-0 h-auto placeholder:text-slate-700 text-white"
                        />
                    </div>
                    <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shrink-0">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1">{t("frequency")}</span>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={frequency}
                                    onChange={(e) => setFrequency(parseInt(e.target.value) || 1)}
                                    className="w-8 bg-transparent border-none focus:outline-none text-white font-bold text-center p-0 h-auto"
                                />
                                <span className="text-[10px] font-bold text-slate-600">{t("daysPerWeek")}</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-slate-800 mx-2" />
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1">{t("duration")}</span>
                            <div className="flex items-center gap-1">
                                <span className="text-white font-bold">{duration}</span>
                                <span className="text-[10px] font-bold text-slate-600">{t("weeks")}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={saveProgram}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8 rounded-2xl shadow-lg shadow-indigo-500/20"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                    {t("save")}
                </Button>
            </div>

            {/* Navigation: Cycles & Days */}
            <div className="space-y-4">
                {/* Cycles Tabs */}
                <div className="flex items-center gap-4 bg-slate-100/5 p-4 rounded-3xl border border-slate-800 overflow-hidden">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none p-1">
                        {cycles.map((cycle) => (
                            <div key={cycle.id} className="group/cycle relative shrink-0">
                                <button
                                    onClick={() => {
                                        setActiveCycleId(cycle.id)
                                        if (cycle.days.length > 0) setActiveDayId(cycle.days[0].id)
                                    }}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap border-2 pr-10",
                                        activeCycleId === cycle.id
                                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                    )}
                                >
                                    <Layers size={18} />
                                    {activeCycleId === cycle.id ? (
                                        <input
                                            value={cycle.name}
                                            onChange={(e) => setCycles(cycles.map(c => c.id === cycle.id ? { ...c, name: e.target.value } : c))}
                                            className="bg-transparent border-none focus:outline-none w-[100px] text-inherit font-bold"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                        />
                                    ) : (
                                        <span>{cycle.name}</span>
                                    )}
                                </button>
                                {cycles.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteCycle(cycle.id)
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/cycle:opacity-100 p-1 hover:text-red-400 transition-all text-slate-500"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <Button variant="ghost" onClick={addCycle} className="rounded-2xl border-2 border-dashed border-slate-800 text-slate-500 hover:text-white h-[52px] shrink-0">
                            <Plus size={20} />
                        </Button>
                    </div>

                    {activeCycle && (
                        <div className="flex items-center gap-3 ml-auto pl-4 border-l border-slate-800 shrink-0">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{t("repeats")}</span>
                                <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                                    <button
                                        onClick={() => {
                                            setCycles(cycles.map(c => c.id === activeCycleId ? { ...c, repeatCount: Math.max(1, c.repeatCount - 1) } : c))
                                        }}
                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white font-bold"
                                    >-</button>
                                    <span className="w-8 text-center font-bold text-indigo-400">{activeCycle.repeatCount}x</span>
                                    <button
                                        onClick={() => {
                                            setCycles(cycles.map(c => c.id === activeCycleId ? { ...c, repeatCount: c.repeatCount + 1 } : c))
                                        }}
                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white font-bold"
                                    >+</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Day Tabs Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
                    {activeCycle?.days.map((day) => (
                        <div key={day.id} className="group/day relative shrink-0">
                            <button
                                onClick={() => setActiveDayId(day.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border-2 pr-8 uppercase tracking-widest",
                                    activeDayId === day.id
                                        ? "bg-slate-100 border-white text-slate-950 shadow-lg shadow-white/10"
                                        : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                                )}
                            >
                                <Calendar size={14} />
                                <span>{day.name}</span>
                            </button>
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover/day:opacity-100 transition-opacity translate-x-1 group-hover/day:translate-x-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); copyDay(activeCycleId!, day) }}
                                    className="p-1 text-slate-500 hover:text-indigo-400"
                                >
                                    <Copy size={12} />
                                </button>
                                {activeCycle.days.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            const newDays = activeCycle.days.filter(d => d.id !== day.id)
                                            setCycles(cycles.map(c => c.id === activeCycleId ? { ...c, days: newDays } : c))
                                            if (activeDayId === day.id) setActiveDayId(newDays[0].id)
                                        }}
                                        className="p-1 text-slate-500 hover:text-red-400"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {activeCycle && activeCycle.days.length < frequency && (
                        <button
                            onClick={() => addDay(activeCycleId!)}
                            className="px-4 py-2 rounded-xl border-2 border-dashed border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                        >
                            <Plus size={14} /> {t("addDay")}
                        </button>
                    )}
                </div>
            </div>

            {/* Active Day Content */}
            <div className="min-h-[500px]">
                {activeCycle?.days.filter(d => d.id === activeDayId).map((day) => (
                    <div key={day.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <span className="text-indigo-500">#</span>
                                <input
                                    value={day.name}
                                    onChange={(e) => updateDay(activeCycleId!, day.id, (d) => ({ ...d, name: e.target.value }))}
                                    className="bg-transparent border-none focus:outline-none w-auto max-w-sm"
                                />
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent" />
                        </div>

                        <div className="space-y-4">
                            {(() => {
                                const renderedSupersets: string[] = []
                                return day.exercises.map((ex, idx) => {
                                    const isSuperset = !!ex.supersetId
                                    const isFirstInSuperset = isSuperset && !renderedSupersets.includes(ex.supersetId!)
                                    if (isSuperset && isFirstInSuperset) renderedSupersets.push(ex.supersetId!)

                                    return (
                                        <div key={ex.id} className={cn(
                                            "relative rounded-3xl p-6 border-2 transition-all group/ex",
                                            isSuperset ? "bg-indigo-950/20 border-indigo-500/30" : "bg-slate-900/40 border-slate-800"
                                        )}>
                                            {isFirstInSuperset && (
                                                <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 rounded-full flex items-center gap-2 shadow-lg z-10">
                                                    <Zap size={12} className="text-white fill-white" />
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{t("superset")}</span>
                                                </div>
                                            )}

                                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                <div className="flex-1 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h4 className="text-lg font-bold text-white leading-tight">{ex.exerciseName}</h4>
                                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{ex.categoryFilter}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col w-16">
                                                        <span className="text-[10px] font-black text-slate-600 uppercase mb-1">{t("sets")}</span>
                                                        <Input
                                                            type="number"
                                                            value={ex.sets}
                                                            onChange={(e) => updateExercise(activeCycleId!, day.id, ex.id, { sets: parseInt(e.target.value) || 0 })}
                                                            className="h-10 bg-slate-950 border-slate-800 text-center rounded-xl font-bold"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col w-28">
                                                        <span className="text-[10px] font-black text-slate-600 uppercase mb-1">{t("reps")}</span>
                                                        <Input
                                                            value={ex.reps.toString()}
                                                            onChange={(e) => updateExercise(activeCycleId!, day.id, ex.id, { reps: e.target.value })}
                                                            placeholder={t("repsPlaceholder")}
                                                            className="h-10 bg-slate-950 border-slate-800 text-center rounded-xl font-bold"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col w-20">
                                                        <span className="text-[10px] font-black text-slate-600 uppercase mb-1">{t("rest")}</span>
                                                        <Input
                                                            type="number"
                                                            value={ex.rest}
                                                            onChange={(e) => updateExercise(activeCycleId!, day.id, ex.id, { rest: parseInt(e.target.value) || 0 })}
                                                            className="h-10 bg-slate-950 border-slate-800 text-center rounded-xl font-bold text-indigo-400"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-700 hover:text-red-400 transition-opacity opacity-0 group-hover/ex:opacity-100"
                                                        onClick={() => deleteExercise(activeCycleId!, day.id, ex.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            })()}

                            {/* Add Actions */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <PopoverMenu
                                    label={activeSupersetId ? t("addToSuperset") : t("addExercise")}
                                    placeholder={t("searchExercises")}
                                    emptyMessage={t("noExerciseFound")}
                                    items={exercises}
                                    onSelect={(ex) => addExercise(activeCycleId!, day.id, ex)}
                                    className={cn(
                                        "flex-1 h-14 rounded-2xl border-2 border-dashed transition-all",
                                        activeSupersetId
                                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                            : "border-slate-800 bg-slate-900/20 text-slate-500 hover:text-white"
                                    )}
                                />
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-14 px-6 rounded-2xl border-2 border-dashed transition-all",
                                        activeSupersetId
                                            ? "border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-500/10"
                                            : "border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10"
                                    )}
                                    onClick={() => {
                                        if (activeSupersetId) {
                                            setActiveSupersetId(null)
                                        } else {
                                            const sid = `superset-${Date.now()}`
                                            setActiveSupersetId(sid)
                                            toast.info(t("supersetMode"))
                                        }
                                    }}
                                >
                                    {activeSupersetId ? (
                                        <><Plus size={18} className="mr-2 rotate-45" /> {t("finishSuperset")}</>
                                    ) : (
                                        <><Zap size={18} className="mr-2" /> {t("newSuperset")}</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- Internal Components ---

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

function PopoverMenu({ label, items, onSelect, className, placeholder, emptyMessage }: {
    label: string,
    items: any[],
    onSelect: (item: any) => void,
    className?: string,
    placeholder?: string,
    emptyMessage?: string
}) {
    const [open, setOpen] = useState(false)
    const t = useTranslations("Programs")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" className={className || "text-[10px] uppercase font-bold text-slate-400 hover:text-white"}>
                    <Plus size={14} className="mr-1" /> {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-slate-900 border-slate-800" align="start">
                <Command className="bg-slate-900">
                    <CommandInput placeholder={placeholder || t("searchExercises")} className="text-white border-slate-800" />
                    <CommandList className="scrollbar-thin scrollbar-thumb-slate-800">
                        <CommandEmpty>{emptyMessage || t("noExerciseFound")}</CommandEmpty>
                        <CommandGroup>
                            {items.map((ex) => (
                                <CommandItem
                                    key={ex.id}
                                    onSelect={() => {
                                        onSelect(ex)
                                        setOpen(false)
                                    }}
                                    className="text-white hover:bg-slate-800 cursor-pointer p-3"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold">{(ex.name as any).default || ex.name}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">{ex.category}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
