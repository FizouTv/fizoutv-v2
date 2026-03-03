import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json(
                { error: "Adresse email invalide" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Check if email already exists
        const { data: existing } = await supabase
            .from("subscribers")
            .select("id")
            .eq("email", email)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: "Vous êtes déjà inscrit à la newsletter." },
                { status: 409 }
            );
        }

        // Insert new subscriber
        const { error } = await supabase.from("subscribers").insert({
            email,
            gdpr_consent: true, // Assumed true as they are submitting the form
        });

        if (error) {
            console.error("Error subscribing:", error);
            return NextResponse.json(
                { error: "Une erreur est survenue lors de l'inscription." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Inscription réussie !" },
            { status: 200 }
        );
    } catch (err) {
        console.error("Newsletter API error:", err);
        return NextResponse.json(
            { error: "Erreur serveur interne." },
            { status: 500 }
        );
    }
}
