import { createClient } from "@/lib/supabase/server";
import SubscribersTable from "./SubscribersTable";

export default async function AdminSubscribersPage() {
    const supabase = await createClient();

    const { data: subscribers } = await supabase
        .from("subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

    return (
        <SubscribersTable subscribers={subscribers || []} />
    );
}
