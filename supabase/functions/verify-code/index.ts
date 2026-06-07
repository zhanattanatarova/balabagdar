import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generatePassword(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("") + "A1!";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(JSON.stringify({ error: "Phone and code required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find valid verification code
    const { data: verification, error: findError } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError || !verification) {
      return new Response(JSON.stringify({ error: "Invalid or expired code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as verified
    await supabase
      .from("phone_verifications")
      .update({ verified: true })
      .eq("id", verification.id);

    const cleanPhone = phone.replace(/\D/g, "");
    const email = `${cleanPhone}@phone.balahub.kz`;

    // Look up existing user by email
    const { data: existing } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    // Use getUserByEmail-style lookup via listUsers filter is not available; we query our secrets table by email-derived user
    // Instead: try to find user via profiles -> phone, or by listing. Simpler: attempt to create; if exists, fetch the existing.

    // Try to fetch stored password by finding the user via auth admin
    let userId: string | null = null;
    {
      // Use admin API: list users filtered manually
      const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list?.users?.find((u: any) => u.email === email);
      if (found) userId = found.id;
    }

    let password: string;
    let isNewUser = false;

    if (userId) {
      // Existing user — fetch stored password
      const { data: secret } = await supabase
        .from("phone_auth_secrets")
        .select("password")
        .eq("user_id", userId)
        .maybeSingle();

      if (secret?.password) {
        password = secret.password;
      } else {
        // Legacy user without stored password: rotate to a new random one
        password = generatePassword();
        const { error: updErr } = await supabase.auth.admin.updateUserById(userId, { password });
        if (updErr) {
          console.error("Password rotation error:", updErr);
          return new Response(JSON.stringify({ error: "Login failed" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        await supabase
          .from("phone_auth_secrets")
          .upsert({ user_id: userId, password }, { onConflict: "user_id" });
      }
    } else {
      // New user — create with fresh random password
      password = generatePassword();
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone },
      });

      if (createError || !newUser?.user) {
        console.error("Create user error:", createError);
        return new Response(JSON.stringify({ error: "Failed to create account" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      userId = newUser.user.id;
      isNewUser = true;

      await supabase
        .from("phone_auth_secrets")
        .insert({ user_id: userId, password });

      await supabase.from("profiles").insert({
        user_id: userId,
        phone,
        display_name: `User ${phone.slice(-4)}`,
      });
    }

    // Sign in
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError || !sessionData?.session) {
      console.error("Session error:", sessionError);
      return new Response(JSON.stringify({ error: "Login failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      session: sessionData.session,
      user: sessionData.user,
      isNewUser,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
