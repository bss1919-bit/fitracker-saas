import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { Link } from "@/i18n/routing"
import { Plus, Calendar, ArrowRight, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AssignProgramDialog } from "@/components/programs/assign-program-dialog"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Navigation")
    return {
        title: `${t("programs")} | FitTracker Pro`,
    }
}

export default async function ProgramsPage() {
    const t = await getTranslations("Programs")
    const navT = await getTranslations("Navigation")
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: programs } = await supabase
        .from("coach_programs")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{navT("programs")}</h1>
                    <p className="text-slate-400 max-w-2xl">{t("description")}</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/dashboard/programs/new">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                            <Plus className="me-2" size={20} />
                            {t("addNew")}
                        </Button>
                    </Link>
                </div>
            </header>

            {(!programs || programs.length === 0) ? (
                <div className="flex flex-col items-center justify-center p-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl text-center space-y-4">
                    <div className="p-4 bg-slate-950 rounded-full border border-slate-800 text-slate-500">
                        <Calendar size={40} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{t("noPrograms")}</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            {t("noProgramsDescription")}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.map((program) => (
                        <div key={program.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-indigo-400">
                                    <Dumbbell size={20} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">
                                {(program.name as any)?.default || t("defaultName")}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                                {(program.description as any)?.default || t("noDescription")}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                                <AssignProgramDialog
                                    programId={program.id}
                                    programName={(program.name as any)?.default || t("defaultName")}
                                />
                                <Link href={`/dashboard/programs/${program.id}`}>
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
                                        {t("edit")} <ArrowRight className="ms-2" size={14} />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
