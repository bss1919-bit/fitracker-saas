"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslations } from "next-intl"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "@/i18n/routing"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

export function AddExerciseDialog() {
    const t = useTranslations("Exercises")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const formSchema = z.object({
        name: z.string().min(2, t("form.nameRequired")),
        category: z.string().min(2, t("form.categoryRequired")),
        instructions: z.string().optional(),
        videoUrl: z.string().url(t("form.invalidUrl")).optional().or(z.literal("")),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: "",
            instructions: "",
            videoUrl: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error("Not authenticated")

            const { error } = await supabase
                .from("coach_exercises")
                .insert({
                    coach_id: user.id,
                    name: { default: values.name },
                    instructions: values.instructions ? { default: values.instructions } : null,
                    video_url: values.videoUrl || null,
                    category: values.category,
                })

            if (error) throw error

            toast.success(t("form.createSuccess"))
            setOpen(false)
            form.reset()
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(t("form.createError"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                    <Plus className="me-2" size={18} />
                    {t("addExercise")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t("addExercise")}</DialogTitle>
                    <DialogDescription>
                        {t("description")}
                    </DialogDescription>
                </DialogHeader>
                <div className="p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1">{t("form.name")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("form.namePlaceholder")} className="bg-slate-950 border-slate-800 h-14 rounded-2xl font-bold px-4 focus:ring-indigo-500/20 shadow-inner" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1">{t("form.category")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("form.categoryPlaceholder")} className="bg-slate-950 border-slate-800 h-14 rounded-2xl font-bold px-4 focus:ring-indigo-500/20 shadow-inner" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="videoUrl"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1">{t("form.videoUrl")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("form.videoUrlPlaceholder")} className="bg-slate-950 border-slate-800 h-14 rounded-2xl font-bold px-4 focus:ring-indigo-500/20 shadow-inner" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="instructions"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1">{t("form.instructions")}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t("form.instructionsPlaceholder")}
                                                className="bg-slate-950 border-slate-800 rounded-2xl font-bold p-4 focus:ring-indigo-500/20 shadow-inner min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="pt-4">
                                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]">
                                    {loading ? <Loader2 className="animate-spin me-2" size={20} /> : null}
                                    {t("form.submit")}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
