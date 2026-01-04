"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Button } from "@/components/ui/button"

export function AddClientDialog() {
    const t = useTranslations("Clients")
    const router = useRouter()
    const supabase = createClient()
    const [open, setOpen] = useState(false)

    const clientSchema = z.object({
        firstName: z.string().min(1, t("form.firstNameRequired")),
        lastName: z.string().optional(),
        email: z.string().email(t("form.invalidEmail")).optional().or(z.literal("")),
        notes: z.string().optional(),
    })

    const form = useForm<z.infer<typeof clientSchema>>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            notes: "",
        },
    })

    async function onSubmit(values: z.infer<typeof clientSchema>) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from("clients")
            .insert({
                coach_id: user.id,
                first_name: values.firstName,
                last_name: values.lastName || null,
                email: values.email || null,
                notes: values.notes || null,
                status: "active"
            })

        if (error) {
            toast.error(t("form.createError"))
            console.error(error)
            return
        }

        toast.success(t("form.createSuccess"))
        form.reset()
        setOpen(false)
        router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                    <Plus size={18} className="me-2" />
                    {t("addNew")}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("addNew")}</DialogTitle>
                    <DialogDescription>
                        {t("form.addNewDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1">{t("form.firstName")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-slate-950 border-slate-800 h-14 rounded-2xl font-bold px-4 focus:ring-indigo-500/20 shadow-inner" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1">{t("form.lastName")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-slate-950 border-slate-800 h-14 rounded-2xl font-bold px-4 focus:ring-indigo-500/20 shadow-inner" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1">{t("form.email")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-slate-950 border-slate-800 h-14 rounded-2xl font-bold px-4 focus:ring-indigo-500/20 shadow-inner" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ms-1">{t("form.notes")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-slate-950 border-slate-800 h-14 rounded-2xl font-bold px-4 focus:ring-indigo-500/20 shadow-inner" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] mt-4">
                                {form.formState.isSubmitting ? "..." : t("form.submit")}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
