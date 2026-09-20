const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const adminEmail = Deno.env.get("TNCC_ADMIN_EMAIL") || "tesonorthcrosscountrycbo@gmail.com";
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const senderEmail = Deno.env.get("TNCC_SENDER_EMAIL") || "TNCC website <onboarding@resend.dev>";

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type BuiltEmail = {
  subject: string;
  text: string;
  replyTo?: string;
  to?: string;
  cc?: string;
  eventId?: string;
};

function buildEmail(type: string, payload: Record<string, unknown>): BuiltEmail | null {
  const name = String(payload.name || "").trim();
  const userEmail = String(payload.email || "").trim();
  const message = String(payload.message || "").trim();
  const phone = String(payload.phone || "").trim();
  const role = String(payload.role || "").trim();

  if (type === "registration") {
    if (!isValidEmail(userEmail)) return null;
    return {
      subject: "New TNCC access request",
      replyTo: userEmail,
      text: [
        "A user requested access to the TNCC workspace.",
        "",
        `Email: ${userEmail}`,
        name ? `Name: ${name}` : "",
        "",
        "Review the user in Supabase Authentication and set profiles.role to admin only after approval.",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }

  if (type === "contact") {
    if (!isValidEmail(userEmail) || !name || !message) return null;
    return {
      subject: `New TNCC contact enquiry from ${name}`,
      replyTo: userEmail,
      text: [
        "New contact enquiry from TNCC website.",
        "",
        `Name: ${name}`,
        `Email: ${userEmail}`,
        phone ? `Phone: ${phone}` : "",
        "",
        "Message:",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }

   if (type === "volunteer") {
     if (!isValidEmail(userEmail) || !name) return null;
     return {
       subject: `New TNCC volunteer application from ${name}`,
       replyTo: userEmail,
       text: [
         "New volunteer application from TNCC website.",
         "",
         `Name: ${name}`,
         `Email: ${userEmail}`,
         phone ? `Phone: ${phone}` : "",
         role ? `Role: ${role}` : "",
         message ? "" : "",
         message ? "Message:" : "",
         message,
       ]
         .filter(Boolean)
         .join("\n"),
     };
   }

   if (type === "event-registration") {
     const eventName = String(payload.event_name || "").trim() || "TNCC event";
     const category = String(payload.selected_category || "").trim();
     const distance = String(payload.race_distance || "").trim();
     const regId = String(payload.registration_id || "").trim();
     const fee = Number(payload.registration_fee || 0);
     const eventId = String(payload.event_id || "").trim();
     const to = String(payload.participant_email || userEmail || "").trim();
     if (!isValidEmail(to) || !name) return null;

     const confirmationBody: string[] = [
       `Dear ${name},`,
       "",
       `Thank you for registering for ${eventName}.`,
       "",
       "Registration details:",
       `  Race category: ${category || "N/A"}`,
       `  Distance: ${distance || "N/A"}`,
       `  Registration fee: ${fee > 0 ? `KES ${fee.toLocaleString("en-US")}` : "FREE"}`,
       regId ? `  Registration ID: ${regId}` : "",
       "",
       "Please keep your registration ID for event day. We will contact you with final race instructions before the event.",
       "",
       "Best regards,",
       "Teso North Cross Country CBO (TNCC)",
     ].filter(Boolean);

      return {
        subject: `${eventName} - Registration Confirmation (ID: ${regId || "pending"})`,
        replyTo: adminEmail,
        text: confirmationBody.join("\n"),
        to,
        cc: isValidEmail(adminEmail) ? adminEmail : undefined,
        eventId,
      };
   }

    return null;
  }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!resendApiKey) return json({ error: "Notification service is not configured" }, 503);

  try {
    const body = await req.json();
    const type = String(body.type || "").trim();
    const payload = (body.payload || {}) as Record<string, unknown>;

    const built = buildEmail(type, payload);
    if (!built) {
      return json(
        {
          error:
            "A valid type (registration | contact | volunteer | event-registration) with required fields is needed",
        },
        400,
      );
    }

    const resendBody: Record<string, unknown> = {
      from: senderEmail,
      to: built.to ? [built.to] : [adminEmail],
      subject: built.subject,
      text: built.text,
    };
    if (built.replyTo) resendBody.reply_to = built.replyTo;
    if (built.cc && isValidEmail(built.cc)) resendBody.cc = [built.cc];

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendBody),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Resend error:", details);
      return json({ error: "Could not send notification email" }, 502);
    }

    const result = await response.json().catch(() => ({}));
    return json({ ok: true, id: (result as Record<string, unknown>).id ?? null });
  } catch (error) {
    console.error(error);
    return json({ error: "Invalid notification request" }, 400);
  }
});