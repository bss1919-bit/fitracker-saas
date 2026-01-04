"use client"

import { useTranslations } from "next-intl"
import { Database } from "@/types/supabase"
import { formatDistanceToNow } from "date-fns"
import { fr, enUS, ar } from "date-fns/locale"
import { Dumbbell, Activity, Heart, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

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
                    className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center gap-6 hover:border-slate-700 transition-all group relative overflow-hidden shadow-xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/[0.02] transition-colors pointer-events-none" />

                    <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:border-slate-700 transition-colors">
                        {getIcon(activity.data_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1">
                            <p className="text-sm font-bold text-white uppercase tracking-tight truncate">
                                {activitiesT.has(activity.data_type) ? activitiesT(activity.data_type) : activity.data_type.replace("_", " ")}
                            </p>
                            <p className={cn(
                                "text-[10px] text-slate-500 font-bold shrink-0",
                                locale !== 'ar' && "uppercase tracking-widest"
                            )}>
                                {formatDistanceToNow(new Date(activity.performed_at!), { addSuffix: true, locale: dateLocale })}
                            </p>
                        </div>
                        {/* Simple payload preview */}
                        <p className="text-xs text-slate-400 line-clamp-1 italic opacity-80">
                            {activity.data_type === 'workout'
                                ? `${(activity.payload as any)?.exercises?.length || 0} Exercises • ${(activity.payload as any)?.duration || 0} Minutes`
                                : JSON.stringify(activity.payload).substring(0, 100)}
                        </p>
                    </div>

                    <div className="hidden md:block ps-4 border-s border-slate-800">
                        <div className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer">
                            <Activity size={16} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
