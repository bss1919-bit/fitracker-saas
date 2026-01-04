import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { ExerciseList } from "@/components/exercises/exercise-list"
import { AddExerciseDialog } from "@/components/exercises/add-exercise-dialog"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default async function LibraryPage() {
    const t = await getTranslations("Exercises")
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: exercises } = await supabase
        .from("coach_exercises")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tight">{t("title")}</h1>
                    <p className="text-slate-400">
                        {t("description")}
                    </p>
                </div>
                <AddExerciseDialog />
            </div>

            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <Input
                        placeholder={t("searchPlaceholder")}
                        className="pl-10 bg-slate-950 border-slate-800 focus:ring-indigo-500 h-11"
                    />
                </div>
            </div>

            <ExerciseList exercises={exercises || []} />
        </div>
    )
}
