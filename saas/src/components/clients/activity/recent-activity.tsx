"use client"

import { useTranslations } from "next-intl"
import { Database } from "@/types/supabase"
import { formatDistanceToNow } from "date-fns"
import { fr, enUS, ar } from "date-fns/locale"
import { Dumbbell, Activity, Heart, Moon } from "lucide-react"

type SyncedData = Database["public"]["Tables"]["synced_data"]["Row"]

interface RecentActivityProps {
    activities: SyncedData[]
    locale: string
}

export function RecentActivity({ activities, locale }: RecentActivityProps) {
    const activitiesT = useTranslations("Activities")
    const dateLocale = locale === "fr" ? fr : locale === "ar" ? ar : enUS

    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-center space-y-4">
                <Activity className="text-slate-700" size={40} />
                <p className="text-slate-400">{activitiesT("noActivity")}</p>
            </div>
        )
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "workout": return <Dumbbell className="text-indigo-400" size={18} />
            case "health_metrics": return <Heart className="text-rose-400" size={18} />
            case "sleep": return <Moon className="text-blue-400" size={18} />
            default: return <Activity className="text-slate-400" size={18} />
        }
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div
                    key={activity.id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-colors"
                >
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
                        {getIcon(activity.data_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-black text-white uppercase tracking-tight truncate">
                                {activitiesT.has(activity.data_type) ? activitiesT(activity.data_type) : activity.data_type.replace("_", " ")}
                            </p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest shrink-0">
                                {formatDistanceToNow(new Date(activity.performed_at!), { addSuffix: true, locale: dateLocale })}
                            </p>
                        </div>
                        {/* Simple payload preview */}
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {JSON.stringify(activity.payload).substring(0, 100)}...
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
