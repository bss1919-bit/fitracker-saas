import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { WorkoutEditor } from "@/components/programs/workout-editor"

export default async function NewProgramPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch exercises for the selector
    const { data: exercises } = await supabase
        .from("coach_exercises")
        .select("*")
        .eq("coach_id", user.id)
        .order("name->>default", { ascending: true })

    const t = await getTranslations("Programs")

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        {t("title")}
                    </h1>
                    <p className="text-slate-400">
                        {t("description")}
                    </p>
                </div>
            </header>

            <WorkoutEditor exercises={exercises || []} />
        </div>
    )
}
