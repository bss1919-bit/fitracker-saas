"use client"

import { useTranslations } from "next-intl"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkoutActivity {
    performed_at: string | null
    payload: any
    data_type: string
}

interface ClientAnalyticsProps {
    activities: WorkoutActivity[]
    locale: string
}

export function ClientAnalytics({ activities, locale }: ClientAnalyticsProps) {
    const t = useTranslations("Clients.analytics")

    // Process data for Volume Chart
    const validActivities = activities.filter(a => a.performed_at !== null) as Array<WorkoutActivity & { performed_at: string }>

    const volumeData = validActivities
        .filter(a => a.data_type === "workout")
        .map(a => {
            let totalVolume = 0
            const payload = a.payload as any
            if (payload?.exercises) {
                payload.exercises.forEach((ex: any) => {
                    if (ex.sets) {
                        ex.sets.forEach((set: any) => {
                            totalVolume += (set.weight || 0) * (set.reps || 0)
                        });
                    }
                });
            }
            return {
                date: new Date(a.performed_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
                fullDate: new Date(a.performed_at),
                volume: totalVolume
            }
        })
        .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())

    if (activities.length === 0) {
        return (
            <div className="p-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-center">
                <p className="text-slate-500 text-sm italic">{t("noData")}</p>
            </div>
        )
    }

    // Stable indicator for heatmap (just display active days from real data)
    const activeDates = new Set(validActivities.map(a => new Date(a.performed_at).toDateString()))

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-indigo-500/10 transition-all hover:border-indigo-500/20">
                    <CardHeader className="bg-slate-950/50 border-b border-slate-800 p-6">
                        <CardTitle className="text-2xl font-black text-white flex items-center gap-3 leading-tight">
                            <TrendingUp size={24} className="text-emerald-400 shrink-0" />
                            <span>{t("volumeTitle")}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] p-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={volumeData}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}kg`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #1e293b',
                                        borderRadius: '12px',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorVolume)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-indigo-500/10 transition-all hover:border-indigo-500/20">
                    <CardHeader className="bg-slate-950/50 border-b border-slate-800 p-6">
                        <CardTitle className="text-2xl font-black text-white flex items-center gap-3 leading-tight">
                            <Activity size={24} className="text-indigo-400 shrink-0" />
                            <span>{t("frequencyTitle")}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-8 h-full min-h-[350px]">
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 28 }).map((_, i) => {
                                const d = new Date()
                                d.setDate(d.getDate() - (27 - i))
                                const isActive = activeDates.has(d.toDateString())
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-8 h-8 md:w-10 md:h-10 rounded-xl transition-all duration-300",
                                            isActive
                                                ? 'bg-indigo-500 shadow-lg shadow-indigo-500/40 scale-110'
                                                : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                                        )}
                                        title={d.toLocaleDateString()}
                                    />
                                )
                            })}
                        </div>
                        <p className="mt-8 text-slate-500 text-xs font-medium italic">Showing activity for the last 28 days</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
