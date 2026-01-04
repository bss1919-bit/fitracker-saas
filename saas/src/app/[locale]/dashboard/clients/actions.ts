"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function assignProgram(clientId: string, programId: string, startDate: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("program_assignments")
        .insert({
            client_id: clientId,
            program_id: programId,
            start_date: startDate,
            status: 'active'
        })

    if (error) throw error

    revalidatePath(`/dashboard/clients/${clientId}`)
}
