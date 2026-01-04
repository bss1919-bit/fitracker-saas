import { cookies } from "next/headers";

export const IMPERSONATION_COOKIE = "impersonated_coach_id";

export async function getImpersonatedCoachId() {
    const cookieStore = await cookies();
    return cookieStore.get(IMPERSONATION_COOKIE)?.value;
}

export async function setImpersonationCookie(coachId: string) {
    const cookieStore = await cookies();
    cookieStore.set(IMPERSONATION_COOKIE, coachId, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600 // 1 hour
    });
}

export async function clearImpersonationCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(IMPERSONATION_COOKIE);
}
