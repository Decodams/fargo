import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  type: 'booking' | 'inquiry';
  reference?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_mode?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  total_price?: number;
  services?: string[];
  home_address?: string;
  notes?: string;
  message?: string;
  inquiry_type?: string;
  product_name?: string;
  confirmation_status?: 'pending' | 'confirmed';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch notification email and site URL from settings
    const { data: settingData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "notification_email")
      .maybeSingle();

    const { data: siteSetting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "site_url")
      .maybeSingle();

    const notifyEmail = settingData?.value ?? "hello@fargosalon.com";
    const siteUrl = (siteSetting?.value ?? "https://fargosalon.com").replace(/\/$/, "");

    // Build email content based on type
    let subject: string;
    let htmlBody: string;

    if (payload.type === "booking") {
      subject = `New Booking — ${payload.reference ?? "No ref"}`;
      const serviceList = payload.services?.map((s) => `<li>${s}</li>`).join("") ?? "";
      const dateStr = payload.scheduled_at
        ? new Date(payload.scheduled_at).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })
        : "Not specified";

      // Determine confirmation state
      const isConfirmationPending = payload.confirmation_status === 'pending';
      const confirmationLabel = isConfirmationPending ? 'Pending Admin Confirmation' : 'Confirmed';

      htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #faf7f2;">
          <h2 style="color: #1a1612; font-family: Georgia, serif;">New Booking Received</h2>
          <p style="color: #6b5a4a;">Reference: <strong>${payload.reference ?? "N/A"}</strong></p>
          <p style="color: #6b5a4a; font-weight: bold; margin-top: 8px;">Status: <strong>${confirmationLabel}</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Customer</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.customer_name}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Email</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.customer_email}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Phone</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.customer_phone ?? "N/A"}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">When</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${dateStr}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Mode</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.service_mode === "home" ? "Home Service" : "In Salon"}</td></tr>
            ${payload.home_address ? `<tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Address</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.home_address}</td></tr>` : ""}
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Duration</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.duration_minutes ?? 0} min</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Total</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">₦${(payload.total_price ?? 0).toLocaleString()}</td></tr>
          </table>
          <h3 style="color: #1a1612; font-family: Georgia, serif;">Services</h3>
          <ul style="color: #3a3025;">${serviceList}</ul>
          ${payload.notes ? `<p style="color: #6b5a4a;"><strong>Notes:</strong> ${payload.notes}</p>` : ""}
          <hr style="border: none; border-top: 1px solid #ebe3d5; margin: 24px 0;" />
          ${isConfirmationPending
            ? '<p style="color: #b85a4e; font-weight: bold;">⚠ This booking requires admin confirmation. The booking confirmation ticket will be released once the admin confirms the payment.</p>'
            : '<p style="color: #3a3025;">✅ Booking confirmed. <a href="${siteUrl}/booking/confirmation" style="color: #b85a4e;">View confirmation ticket</a>.</p>'}
          <hr style="border: none; border-top: 1px solid #ebe3d5; margin: 24px 0;" />
          <p style="color: #8a7766; font-size: 13px;">Manage this booking in the <a href="${siteUrl}/admin/bookings" style="color: #b85a4e;">admin dashboard</a>.</p>
        </div>
      `;
    } else {
      subject = `New ${payload.inquiry_type ?? "general"} inquiry from ${payload.customer_name}`;
      htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #faf7f2;">
          <h2 style="color: #1a1612; font-family: Georgia, serif;">New Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">From</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.customer_name}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Email</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.customer_email}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Phone</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.customer_phone ?? "N/A"}</td></tr>
            ${payload.product_name ? `<tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Product</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.product_name}</td></tr>` : ""}
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Type</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.inquiry_type ?? "general"}</td></tr>
          </table>
          <h3 style="color: #1a1612; font-family: Georgia, serif;">Message</h3>
          <p style="color: #3a3025; padding: 12px; background: #f5f0e8; border-left: 3px solid #b85a4e;">${payload.message ?? "No message"}</p>
          <hr style="border: none; border-top: 1px solid #ebe3d5; margin: 24px 0;" />
          <p style="color: #8a7766; font-size: 13px;">Reply directly to ${payload.customer_email} or manage in the <a href="${siteUrl}/admin/inquiries" style="color: #b85a4e;">admin dashboard</a>.</p>
        </div>
      `;
    }

    // Try to send email via Resend if API key is configured
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Fargo Salon <onboarding@resend.dev>",
          to: [notifyEmail],
          subject,
          html: htmlBody,
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error("Email send failed:", errText);
        // Still return success — the booking/inquiry was saved, email is secondary
      }
    } else {
      console.log("No RESEND_API_KEY configured — notification email not sent. Payload logged for reference.");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification processed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Notification error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
