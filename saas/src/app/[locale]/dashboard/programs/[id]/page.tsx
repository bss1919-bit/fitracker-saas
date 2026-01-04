import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { WorkoutEditor } from "@/components/programs/workout-editor"

export default async function ProgramDetailPage({
    params
}: {
    params: Promise<{ id: string; locale: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch program
    const { data: program, error } = await supabase
        .from("coach_programs")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !program) {
        notFound()
    }

    // Fetch exercises for selector
    const { data: exercises } = await supabase
        .from("coach_exercises")
        .select("*")
        .eq("coach_id", user.id)
        .order("name->>default", { ascending: true })

    const t = await getTranslations("Programs")

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white">{t("editTitle")}</h1>
                <p className="text-slate-500">{t("editDescription")}</p>
            </div>

            <WorkoutEditor
                initialData={{
                    id: program.id,
                    name: program.name,
                    days: (program.structure as any)?.days || []
                }}
                exercises={exercises || []}
            />
        </div>
    )
}
