import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
        const supabase = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const now = new Date().toISOString();
        const { data: pendingNewsletters, error: fetchError } = await supabase
            .from("newsletters")
            .select("*")
            .eq("status", "scheduled")
            .lte("scheduled_for", now);

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!pendingNewsletters || pendingNewsletters.length === 0) {
            return NextResponse.json({ message: "Aucune newsletter à envoyer" });
        }

        const { data: subscribers } = await supabase
            .from("subscribers")
            .select("email");

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({ message: "Aucun abonné" });
        }

        const results = [];

        for (const newsletter of pendingNewsletters) {
            const htmlEmail = buildEmailTemplate(newsletter.subject, newsletter.content);
            let sentCount = 0;

            for (const sub of subscribers) {
                try {
                    await transporter.sendMail({
                        from: `"FizouTV Newsletter" <${process.env.GMAIL_USER}>`,
                        to: sub.email,
                        subject: newsletter.subject,
                        html: htmlEmail,
                    });
                    sentCount++;
                } catch (err: any) {
                    console.error(`Error sending to ${sub.email}:`, err.message);
                }
            }

            await supabase
                .from("newsletters")
                .update({ sent_at: new Date().toISOString(), status: "sent" })
                .eq("id", newsletter.id);

            results.push({ id: newsletter.id, subject: newsletter.subject, sentCount });
        }

        return NextResponse.json({
            message: `${results.length} newsletter(s) envoyée(s)`,
            results,
        });
    } catch (err) {
        console.error("Cron newsletter error:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

function buildEmailTemplate(subject: string, content: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            margin: 0; padding: 0;
            background-color: #0f0f0f;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #f5f5f5;
        }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
        .header {
            background: linear-gradient(135deg, #e3342f 0%, #b91c1c 100%);
            padding: 24px 32px; text-align: center;
        }
        .header h1 { margin: 0; color: #fff; font-size: 28px; font-weight: 900; letter-spacing: 2px; }
        .content { padding: 32px; line-height: 1.7; font-size: 16px; color: #e0e0e0; }
        .content h1, .content h2, .content h3 { color: #fff; margin-top: 24px; }
        .content p { margin: 12px 0; }
        .content a { color: #e3342f; text-decoration: underline; }
        .content img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
        .content blockquote {
            border-left: 4px solid #e3342f; margin: 16px 0;
            padding: 12px 20px; background-color: rgba(227,52,47,0.1);
        }
        .footer {
            padding: 24px 32px; text-align: center;
            font-size: 12px; color: #666; border-top: 1px solid #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>FIZOUTV</h1></div>
        <div class="content">${content}</div>
        <div class="footer">
            <p>© 2026 FizouTV - Tous droits réservés</p>
            <p>Vous recevez cet email car vous êtes inscrit à la newsletter FizouTV.</p>
        </div>
    </div>
</body>
</html>`;
}
