"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    return { supabase, currentUserId: user.id };
}

export async function deleteUser(userId: string) {
    const { supabase, currentUserId } = await requireAdmin();

    if (userId === currentUserId) {
        return { error: "Vous ne pouvez pas supprimer votre propre compte." };
    }

    // Delete profile from DB
    const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

    if (profileError) return { error: profileError.message };

    // Delete auth user using admin client
    try {
        const adminClient = createAdminClient();
        const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
        if (authError) {
            console.error("Error deleting auth user:", authError);
            // Profile is already deleted, log the auth error but don't fail
        }
    } catch (e) {
        console.error("Admin client error:", e);
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function toggleAdminRole(userId: string, currentRole: string) {
    const { supabase, currentUserId } = await requireAdmin();

    if (userId === currentUserId) {
        return { error: "Vous ne pouvez pas modifier votre propre rôle." };
    }

    const newRole = currentRole === "admin" ? "member" : "admin";

    const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    return { success: true, newRole };
}
