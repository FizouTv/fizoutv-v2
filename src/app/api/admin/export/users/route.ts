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

        const { data: profiles } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        const rows = (profiles || []).map((p) => ({
            "ID": p.id,
            "Email": p.email || "",
            "Nom": p.last_name || "",
            "Prénom": p.first_name || "",
            "Nom d'affichage": p.display_name || "Sans nom",
            "Sexe": p.sex || "",
            "Nationalité": p.nationality || "",
            "Date de naissance": p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString("fr-FR") : "",
            "Rôle": p.role === "admin" ? "Administrateur" : "Membre",
            "Consentement Stats": p.stats_consent ? "Oui" : "Non",
            "Date d'inscription": new Date(p.created_at).toLocaleDateString("fr-FR"),
            "Avatar URL": p.avatar_url || "",
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);

        // Auto-size columns
        ws["!cols"] = [
            { wch: 35 }, // ID
            { wch: 30 }, // Email
            { wch: 15 }, // Nom
            { wch: 15 }, // Prenom
            { wch: 20 }, // Display Name
            { wch: 10 }, // Sexe
            { wch: 15 }, // Nationalité
            { wch: 15 }, // Date Naissance
            { wch: 15 }, // Rôle
            { wch: 15 }, // Consent
            { wch: 15 }, // Date Inscription
            { wch: 30 }, // Avatar URL
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Utilisateurs");

        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buf, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="utilisateurs_fizoutv_${new Date().toISOString().split("T")[0]}.xlsx"`,
            },
        });
    } catch {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
