import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { syncPayloadSchema } from "@/lib/validations/sync";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];

        // 1. Validate Payload
        const validatedData = syncPayloadSchema.parse(body);
        const { clientId, dataType, items } = validatedData;

        const supabase = createAdminClient();

        // 2. Authorize
        const { data: client, error: authError } = await supabase
            .from("clients")
            .select("id")
            .eq("id", clientId)
            .eq("sync_token", (token as any))
            .single();

        if (authError || !client) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 3. Prepare for batch upsert
        // We use the unique constraint (client_id, data_type, mobile_object_id)
        const recordsToSync = items.map((item) => ({
            client_id: clientId,
            data_type: dataType,
            mobile_object_id: item.id,
            payload: item.payload as any,
            performed_at: item.performed_at || new Date().toISOString(),
            tags: item.tags || [],
            updated_at: new Date().toISOString(),
        }));

        // 4. Upsert into synced_data
        const { error } = await supabase
            .from("synced_data")
            .upsert(recordsToSync, {
                onConflict: "client_id, data_type, mobile_object_id"
            });

        if (error) {
            console.error("Sync Upsert Error:", error);
            return NextResponse.json({ error: "Failed to store sync data" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: recordsToSync.length
        });

    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ error: "Invalid payload", details: error.errors }, { status: 400 });
        }
        console.error("API Sync Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
