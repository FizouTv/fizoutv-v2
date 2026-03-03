import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const { data: subscribers } = await supabase
            .from("subscribers")
            .select("*")
            .order("subscribed_at", { ascending: false });

        const rows = (subscribers || []).map((s) => ({
            "Email": s.email,
            "Consentement RGPD": s.gdpr_consent ? "Oui" : "Non",
            "Date d'inscription": new Date(s.subscribed_at).toLocaleDateString("fr-FR"),
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);

        ws["!cols"] = [
            { wch: 35 },
            { wch: 20 },
            { wch: 20 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Abonnés");

        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buf, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="abonnes_fizoutv_${new Date().toISOString().split("T")[0]}.xlsx"`,
            },
        });
    } catch {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
