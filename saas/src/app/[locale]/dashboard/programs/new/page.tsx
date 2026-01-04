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

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white">Program Builder</h1>
                <p className="text-slate-500">Design your training template by adding days and exercises.</p>
            </div>

            <WorkoutEditor exercises={exercises || []} />
        </div>
    )
}
