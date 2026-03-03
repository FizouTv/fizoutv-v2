import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * DELETE /api/account/delete
 * Deletes the currently authenticated user's account from both
 * the profiles table and Supabase Auth.
 */
export async function DELETE() {
    try {
        // 1. Verify the user is authenticated
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        // 2. Delete profile from DB (cascade should handle related data)
        const { error: profileError } = await supabase
            .from("profiles")
            .delete()
            .eq("id", user.id);

        if (profileError) {
            console.error("Error deleting profile:", profileError);
            // Continue anyway — we still want to delete the auth user
        }

        // 3. Delete the auth user using admin client
        const adminClient = createAdminClient();
        const { error: authError } =
            await adminClient.auth.admin.deleteUser(user.id);

        if (authError) {
            console.error("Error deleting auth user:", authError);
            return NextResponse.json(
                { error: "Erreur lors de la suppression du compte. Contactez le support." },
                { status: 500 }
            );
        }

        // 4. Sign out the user's session
        await supabase.auth.signOut();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Account deletion error:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
