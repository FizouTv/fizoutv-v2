"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") throw new Error("Accès refusé");
    return { supabase };
}

export async function deleteSubscriber(subscriberId: string) {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
        .from("subscribers")
        .delete()
        .eq("id", subscriberId);

    if (error) return { error: error.message };

    revalidatePath("/admin/subscribers");
    return { success: true };
}
