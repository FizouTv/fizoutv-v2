import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function POST(request: Request) {
    try {
        const { newsletterId } = await request.json();

        if (!newsletterId) {
            return NextResponse.json({ error: "newsletterId requis" }, { status: 400 });
        }

        const supabase = await createClient();

        // Verify the user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        // Fetch the newsletter
        const { data: newsletter, error: nlError } = await supabase
            .from("newsletters")
            .select("*")
            .eq("id", newsletterId)
            .single();

        if (nlError || !newsletter) {
            return NextResponse.json({ error: "Newsletter introuvable" }, { status: 404 });
        }

        if (newsletter.sent_at) {
            return NextResponse.json({ error: "Newsletter déjà envoyée" }, { status: 400 });
        }

        // Fetch all subscribers
        const { data: subscribers } = await supabase
            .from("subscribers")
            .select("email");

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({ error: "Aucun abonné" }, { status: 400 });
        }

        // Build HTML email
        const htmlEmail = buildEmailTemplate(newsletter.subject, newsletter.content);

        // Send emails one by one (Gmail limit: 500/day)
        const emails = subscribers.map((s) => s.email);
        let sentCount = 0;
        const errors: string[] = [];

        for (const to of emails) {
            try {
                await transporter.sendMail({
                    from: `"FizouTV Newsletter" <${process.env.GMAIL_USER}>`,
                    to,
                    subject: newsletter.subject,
                    html: htmlEmail,
                });
                sentCount++;
            } catch (err: any) {
                console.error(`Error sending to ${to}:`, err.message);
                errors.push(`${to}: ${err.message}`);
            }
        }

        // Mark as sent
        await supabase
            .from("newsletters")
            .update({
                sent_at: new Date().toISOString(),
                status: "sent",
            })
            .eq("id", newsletterId);

        return NextResponse.json({
            message: `Newsletter envoyée à ${sentCount}/${emails.length} abonné(s)`,
            sentCount,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (err) {
        console.error("Send newsletter error:", err);
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
            margin: 0;
            padding: 0;
            background-color: #0f0f0f;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1a1a;
        }
        .header {
            background: linear-gradient(135deg, #e3342f 0%, #b91c1c 100%);
            padding: 24px 32px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 28px;
            font-weight: 900;
            letter-spacing: 2px;
        }
        .content {
            padding: 32px;
            line-height: 1.7;
            font-size: 16px;
            color: #e0e0e0;
        }
        .content h1, .content h2, .content h3 {
            color: #ffffff;
            margin-top: 24px;
        }
        .content h1 { font-size: 24px; }
        .content h2 { font-size: 20px; }
        .content h3 { font-size: 18px; }
        .content p { margin: 12px 0; }
        .content a {
            color: #e3342f;
            text-decoration: underline;
        }
        .content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 16px 0;
        }
        .content blockquote {
            border-left: 4px solid #e3342f;
            margin: 16px 0;
            padding: 12px 20px;
            background-color: rgba(227, 52, 47, 0.1);
            color: #f5f5f5;
        }
        .footer {
            padding: 24px 32px;
            text-align: center;
            font-size: 12px;
            color: #666666;
            border-top: 1px solid #333333;
        }
        .footer a { color: #e3342f; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FIZOUTV</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© 2026 FizouTV - Tous droits réservés</p>
            <p>Vous recevez cet email car vous êtes inscrit à la newsletter FizouTV.</p>
        </div>
    </div>
</body>
</html>`;
}
