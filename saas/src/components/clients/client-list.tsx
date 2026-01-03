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
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { Eye } from "lucide-react"
import { Database } from "@/types/supabase"
import { cn } from "@/lib/utils"

type Client = Database["public"]["Tables"]["clients"]["Row"]

interface ClientListProps {
    clients: Client[]
}

export function ClientList({ clients }: ClientListProps) {
    const t = useTranslations("Clients")

    if (clients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-slate-800 rounded-xl">
                <p className="text-slate-400">{t("noClients")}</p>
            </div>
        )
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-950">
                    <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400 font-medium">{t("table.name")}</TableHead>
                        <TableHead className="text-slate-400 font-medium">{t("table.email")}</TableHead>
                        <TableHead className="text-slate-400 font-medium">{t("table.status")}</TableHead>
                        <TableHead className="text-right text-slate-400 font-medium">{t("table.actions")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => (
                        <TableRow key={client.id} className="border-slate-800 hover:bg-slate-800/50">
                            <TableCell className="font-medium text-white">
                                {client.first_name} {client.last_name || ""}
                            </TableCell>
                            <TableCell className="text-slate-400">{client.email || "-"}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "capitalize",
                                        client.status === "active" ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/5" : "border-slate-700 text-slate-400"
                                    )}
                                >
                                    {t(`status.${client.status || 'active'}`)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild className="hover:text-indigo-400 transition-colors">
                                    <Link href={`/dashboard/clients/${client.id}`}>
                                        <Eye size={18} className="mr-2" />
                                        {t("table.viewProfile")}
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
