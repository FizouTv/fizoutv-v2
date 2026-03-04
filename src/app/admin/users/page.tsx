export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import UsersTable from "./UsersTable";

export default async function AdminUsersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <UsersTable
            profiles={profiles || []}
            currentUserId={user?.id || ""}
        />
    );
}
