import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  type: 'booking' | 'inquiry' | 'booking_confirmed' | 'product_order';
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
  delivery_method?: 'walk_in' | 'delivery';
  delivery_fee?: number;
  items?: { name: string; quantity: number; price: number }[];
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

    const notifyEmail = settingData?.value ?? "Fargounisexsalon@gmail.com";
    const siteUrl = (siteSetting?.value ?? "https://fargounisexsalon.com").replace(/\/$/, "");

    let subject: string;
    let htmlBody: string;
    let recipientEmail: string;

    if (payload.type === "booking") {
      // New booking → email the admin
      subject = `New Booking — ${payload.reference ?? "No ref"}`;
      recipientEmail = notifyEmail;
      const serviceList = payload.services?.map((s) => `<li>${s}</li>`).join("") ?? "";
      const dateStr = payload.scheduled_at
        ? new Date(payload.scheduled_at).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })
        : "Not specified";
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
            ? '<p style="color: #b85a4e; font-weight: bold;">This booking requires admin confirmation. The booking confirmation ticket will be released once the admin confirms the payment.</p>'
            : '<p style="color: #3a3025;">Booking confirmed. The customer has been notified.</p>'}
          <hr style="border: none; border-top: 1px solid #ebe3d5; margin: 24px 0;" />
          <p style="color: #8a7766; font-size: 13px;">Manage this booking in the <a href="${siteUrl}/admin/bookings" style="color: #b85a4e;">admin dashboard</a>.</p>
        </div>
      `;
    } else if (payload.type === "booking_confirmed") {
      // Payment confirmed → email the customer
      subject = `Booking Confirmed — ${payload.reference ?? ""}`;
      recipientEmail = payload.customer_email;
      const serviceList = payload.services?.map((s) => `<li>${s}</li>`).join("") ?? "";
      const dateStr = payload.scheduled_at
        ? new Date(payload.scheduled_at).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })
        : "Not specified";

      htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #faf7f2;">
          <h2 style="color: #1a1612; font-family: Georgia, serif;">Your Booking is Confirmed</h2>
          <p style="color: #6b5a4a;">Hi <strong>${payload.customer_name}</strong>,</p>
          <p style="color: #6b5a4a;">Your payment has been verified and your booking is now confirmed.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Reference</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5; font-weight: bold;">${payload.reference ?? "N/A"}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">When</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${dateStr}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Mode</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.service_mode === "home" ? "Home Service" : "In Salon"}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Total</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">₦${(payload.total_price ?? 0).toLocaleString()}</td></tr>
          </table>
          <h3 style="color: #1a1612; font-family: Georgia, serif;">Services</h3>
          <ul style="color: #3a3025;">${serviceList}</ul>
          <hr style="border: none; border-top: 1px solid #ebe3d5; margin: 24px 0;" />
          <p style="color: #3a3025;">View your booking confirmation ticket and download your PDF pass:</p>
          <p style="margin: 16px 0;"><a href="${siteUrl}/booking/confirmation" style="display: inline-block; padding: 12px 24px; background: #1a1612; color: #faf7f2; text-decoration: none; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;">View Confirmation Ticket</a></p>
          <hr style="border: none; border-top: 1px solid #ebe3d5; margin: 24px 0;" />
          <p style="color: #8a7766; font-size: 13px;">Questions? Contact us at <a href="mailto:${notifyEmail}" style="color: #b85a4e;">${notifyEmail}</a></p>
        </div>
      `;
    } else if (payload.type === "product_order") {
      // New product order → email the admin
      subject = `New Product Order — ${payload.reference ?? "No ref"}`;
      recipientEmail = notifyEmail;
      const itemList = payload.items?.map((i) => `<li>${i.name} × ${i.quantity} — ₦${(i.price * i.quantity).toLocaleString()}</li>`).join("") ?? "";
      const deliveryLabel = payload.delivery_method === "delivery" ? "Home Delivery" : "Salon Pickup";

      htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #faf7f2;">
          <h2 style="color: #1a1612; font-family: Georgia, serif;">New Product Order</h2>
          <p style="color: #6b5a4a;">Reference: <strong>${payload.reference ?? "N/A"}</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Customer</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.customer_name}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Email</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.customer_email}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Phone</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.customer_phone ?? "N/A"}</td></tr>
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Fulfilment</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${deliveryLabel}</td></tr>
            ${payload.home_address ? `<tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Address</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">${payload.home_address}</td></tr>` : ""}
            ${payload.delivery_fee ? `<tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Delivery Fee</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">₦${payload.delivery_fee.toLocaleString()}</td></tr>` : ""}
            <tr><td style="padding: 8px; color: #8a7766; border-bottom: 1px solid #ebe3d5;">Total</td><td style="padding: 8px; color: #1a1612; border-bottom: 1px solid #ebe3d5;">₦${(payload.total_price ?? 0).toLocaleString()}</td></tr>
          </table>
          <h3 style="color: #1a1612; font-family: Georgia, serif;">Items</h3>
          <ul style="color: #3a3025;">${itemList}</ul>
          ${payload.notes ? `<p style="color: #6b5a4a;"><strong>Notes:</strong> ${payload.notes}</p>` : ""}
          <hr style="border: none; border-top: 1px solid #ebe3d5; margin: 24px 0;" />
          <p style="color: #8a7766; font-size: 13px;">Manage this order in the <a href="${siteUrl}/admin/orders" style="color: #b85a4e;">admin dashboard</a>.</p>
        </div>
      `;
    } else {
      // Inquiry → email the admin
      subject = `New ${payload.inquiry_type ?? "general"} inquiry from ${payload.customer_name}`;
      recipientEmail = notifyEmail;
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

    // Send email via Resend if API key is configured
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
          to: [recipientEmail],
          subject,
          html: htmlBody,
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error("Email send failed:", errText);
      }
    } else {
      console.log("No RESEND_API_KEY configured — notification email not sent. Payload:", JSON.stringify(payload));
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
