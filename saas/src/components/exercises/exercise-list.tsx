"use client"

import { useTranslations } from "next-intl"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Database } from "@/types/supabase"
import { Video, FileText, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Exercise = Database["public"]["Tables"]["coach_exercises"]["Row"]

interface ExerciseListProps {
    exercises: Exercise[]
}

export function ExerciseList({ exercises }: ExerciseListProps) {
    const t = useTranslations("Exercises")

    if (exercises.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-center space-y-4">
                <div className="p-4 bg-slate-950 rounded-full border border-slate-800 text-slate-500">
                    <FileText size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">{t("empty")}</h3>
                    <p className="text-slate-500 max-w-xs mx-auto text-sm mt-1">
                        {t("emptyDescription")}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
            <Table>
                <TableHeader className="bg-slate-950/50">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400 font-semibold">{t("table.name")}</TableHead>
                        <TableHead className="text-slate-400 font-semibold">{t("table.category")}</TableHead>
                        <TableHead className="text-slate-400 font-semibold text-center mt-2 flex items-center justify-center gap-2">
                            {t("table.media")}
                        </TableHead>
                        <TableHead className="text-slate-400 font-semibold text-end">{t("table.actions")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {exercises.map((exercise) => {
                        const name = (exercise.name as any)?.default || t("unknownExercise")

                        return (
                            <TableRow key={exercise.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors group">
                                <TableCell className="font-medium text-white py-4">
                                    {name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-slate-700 text-slate-400 bg-slate-800/50 capitalize font-normal">
                                        {exercise.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {exercise.video_url && (
                                            <Video size={16} className="text-indigo-400" />
                                        )}
                                        {exercise.instructions && (
                                            <FileText size={16} className="text-slate-500" />
                                        )}
                                        {!exercise.video_url && !exercise.instructions && (
                                            <span className="text-slate-700 text-xs">-</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-end">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-800">
                                            <Pencil size={14} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-slate-800">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
