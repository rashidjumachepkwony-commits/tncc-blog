const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const adminEmail = Deno.env.get("TNCC_ADMIN_EMAIL") || "rashidjumachepkwony@gmail.com";
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const senderEmail = Deno.env.get("TNCC_SENDER_EMAIL") || "TNCC website <onboarding@resend.dev>";

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!resendApiKey) return json({ error: "Notification service is not configured" }, 503);

  try {
    const body = await req.json();
    const type = String(body.type || "");
    const payload = body.payload || {};
    const userEmail = String(payload.email || "").trim();
    if (type !== "registration" || !userEmail || !userEmail.includes("@")) {
      return json({ error: "A valid registration email is required" }, 400);
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [adminEmail],
        subject: "New TNCC access request",
        text: [
          "A user requested access to the TNCC workspace.",
          "",
          `Email: ${userEmail}`,
          "",
          "Review the user in Supabase Authentication and set profiles.role to admin only after approval."
        ].join("\n")
      })
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Resend error:", details);
      return json({ error: "Could not send access request notification" }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: "Invalid notification request" }, 400);
  }
});
