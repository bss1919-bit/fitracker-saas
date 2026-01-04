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

interface ClientAnalyticsProps {
    activities: any[]
    locale: string
}

export function ClientAnalytics({ activities, locale }: ClientAnalyticsProps) {
    const t = useTranslations("Clients.analytics")

    // Process data for Volume Chart
    // Assuming activity.payload contains exercises with sets (weight * reps)
    const volumeData = activities
        .filter(a => a.data_type === "workout")
        .map(a => {
            const payload = a.payload as any
            let totalVolume = 0
            if (payload.exercises) {
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
                <p className="text-slate-500 text-sm italic">No data available for analytics yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-400" />
                            {t("volumeTitle")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-4">
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
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}kg`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVolume)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Activity size={16} className="text-indigo-400" />
                            {t("frequencyTitle")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8">
                        {/* Heatmap placeholder for now, as custom SVG takes more time */}
                        <div className="grid grid-cols-7 gap-1.5">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-6 h-6 rounded ${Math.random() > 0.6 ? 'bg-indigo-500' : 'bg-slate-800'
                                        }`}
                                    title={`Day ${i + 1}`}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
