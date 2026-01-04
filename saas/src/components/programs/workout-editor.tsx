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
    Zap,
    GripVertical
} from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
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
        return rawCycles.map((c: any) => ({
            ...c,
            id: c.id || crypto.randomUUID(),
            days: (c.days || c.sessions || []).map((d: any) => ({
                ...d,
                id: d.id || crypto.randomUUID()
            })),
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

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result
        if (!destination) return
        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const [cycleId, dayId] = source.droppableId.split(":")

        setCycles(prev => prev.map(cycle => {
            if (cycle.id !== cycleId) return cycle
            return {
                ...cycle,
                days: cycle.days.map(day => {
                    if (day.id !== dayId) return day
                    const newExercises = Array.from(day.exercises)
                    const [removed] = newExercises.splice(source.index, 1)
                    newExercises.splice(destination.index, 0, removed)
                    return { ...day, exercises: newExercises }
                })
            }
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
        <div className="space-y-8 pb-32">
            <DragDropContext onDragEnd={onDragEnd}>
                {/* Header / Save Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl sticky top-4 z-40 backdrop-blur-md bg-opacity-90">
                    <div className="flex-1 w-full md:w-auto flex items-center gap-4">
                        <div className="flex-1">
                            <Input
                                value={programName}
                                onChange={(e) => setProgramName(e.target.value)}
                                placeholder={t("programName")}
                                className="bg-transparent border-none text-2xl font-black text-white focus:ring-0 placeholder:text-slate-700 p-0"
                            />
                            <div className="flex items-center gap-4 mt-1 text-[10px] uppercase font-black tracking-widest text-slate-500">
                                <span className="flex items-center gap-1"><Layers size={10} /> {cycles.length} {t("cycles")}</span>
                                <span className="flex items-center gap-1"><Calendar size={10} /> {duration} {t("weeksShort")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center bg-slate-950 rounded-2xl p-1 border border-slate-800">
                            {[2, 3, 4, 5, 6].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFrequency(f)}
                                    className={cn(
                                        "w-10 h-10 rounded-xl text-xs font-black transition-all",
                                        frequency === f ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <Button
                            onClick={saveProgram}
                            disabled={loading}
                            className="h-12 px-8 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            {t("save")}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Cycles Tabs */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                                {cycles.map((cycle) => (
                                    <div key={cycle.id} className="group relative">
                                        <button
                                            onClick={() => {
                                                setActiveCycleId(cycle.id)
                                                if (cycle.days.length > 0) setActiveDayId(cycle.days[0].id)
                                            }}
                                            className={cn(
                                                "px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 uppercase tracking-widest",
                                                activeCycleId === cycle.id
                                                    ? "bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/20"
                                                    : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                                            )}
                                        >
                                            {cycle.name}
                                        </button>
                                        {cycles.length > 1 && (
                                            <button
                                                onClick={() => deleteCycle(cycle.id)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-slate-950 shadow-lg"
                                            >
                                                <Plus size={12} className="rotate-45" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    onClick={addCycle}
                                    className="px-6 py-3 h-auto rounded-2xl border-2 border-dashed border-slate-800 bg-transparent text-slate-500 hover:text-white hover:border-slate-600 text-xs font-black uppercase tracking-widest"
                                >
                                    <Plus size={16} className="mr-2" /> {t("addCycle")}
                                </Button>
                            </div>
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
                                        <span className="text-indigo-500 font-mono">#</span>
                                        <input
                                            value={day.name}
                                            onChange={(e) => updateDay(activeCycleId!, day.id, (d) => ({ ...d, name: e.target.value }))}
                                            className="bg-transparent border-none focus:outline-none w-auto max-w-sm"
                                        />
                                    </h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent" />
                                </div>

                                <Droppable droppableId={`${activeCycleId}:${day.id}`}>
                                    {(provided) => (
                                        <div className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
                                            {(() => {
                                                const renderedSupersets: string[] = []
                                                return day.exercises.map((ex, idx) => {
                                                    const isSuperset = !!ex.supersetId
                                                    const isFirstInSuperset = isSuperset && !renderedSupersets.includes(ex.supersetId!)
                                                    if (isSuperset && isFirstInSuperset) renderedSupersets.push(ex.supersetId!)

                                                    return (
                                                        <Draggable key={ex.id} draggableId={ex.id} index={idx}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={cn(
                                                                        "relative rounded-3xl p-6 border-2 transition-all group/ex",
                                                                        isSuperset ? "bg-indigo-950/20 border-indigo-500/30" : "bg-slate-900/40 border-slate-800"
                                                                    )}
                                                                >
                                                                    <div {...provided.dragHandleProps} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-slate-700 hover:text-slate-400 cursor-grab active:cursor-grabbing transition-opacity opacity-0 group-hover/ex:opacity-100">
                                                                        <GripVertical size={16} />
                                                                    </div>

                                                                    {isFirstInSuperset && (
                                                                        <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 rounded-full flex items-center gap-2 shadow-lg z-10">
                                                                            <Zap size={12} className="text-white fill-white" />
                                                                            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{t("superset")}</span>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex flex-col md:flex-row md:items-center gap-6 ps-4">
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
                                                            )}
                                                        </Draggable>
                                                    )
                                                })
                                            })()}
                                            {provided.placeholder}

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
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </div>
            </DragDropContext>
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
