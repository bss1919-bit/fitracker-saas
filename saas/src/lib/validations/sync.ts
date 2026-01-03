import { z } from "zod";

export const syncItemSchema = z.object({
    id: z.string(), // mobile_object_id
    performed_at: z.string().datetime().optional(),
    payload: z.record(z.string(), z.any()), // The actual data (workout details, health metrics, etc.)
    tags: z.array(z.string()).optional(),
});

export const syncPayloadSchema = z.object({
    clientId: z.string().uuid(),
    dataType: z.enum(["workout", "health_metrics", "nutrition", "sleep"]),
    items: z.array(syncItemSchema),
});

export type SyncPayload = z.infer<typeof syncPayloadSchema>;
export type SyncItem = z.infer<typeof syncItemSchema>;
