import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function emailFromPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  return `${cleanPhone}@phone.balahub.kz`;
}

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code, password, mode } = await req.json();

    if (!phone || !code) {
      return json(400, { error: "Phone and code required" });
    }

    // mode: "register" | "reset"
    const flow: "register" | "reset" = mode === "reset" ? "reset" : "register";

    if (!password || typeof password !== "string" || password.length < 6) {
      return json(400, { error: "Password must be at least 6 characters" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify code
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
      return json(400, { error: "Invalid or expired code" });
    }

    await supabase
      .from("phone_verifications")
      .update({ verified: true })
      .eq("id", verification.id);

    const email = emailFromPhone(phone);

    // Find existing user by email
    let userId: string | null = null;
    const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const found = list?.users?.find((u: any) => u.email === email);
    if (found) userId = found.id;

    if (flow === "register") {
      if (userId) {
        return json(409, { error: "already_registered" });
      }
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone },
      });
      if (createError || !newUser?.user) {
        console.error("Create user error:", createError);
        return json(500, { error: "Failed to create account" });
      }
      userId = newUser.user.id;

      await supabase
        .from("phone_auth_secrets")
        .upsert({ user_id: userId, password }, { onConflict: "user_id" });

      await supabase.from("profiles").insert({
        user_id: userId,
        phone,
        display_name: `User ${phone.slice(-4)}`,
      });
    } else {
      // reset
      if (!userId) {
        return json(404, { error: "not_registered" });
      }
      const { error: updErr } = await supabase.auth.admin.updateUserById(userId, { password });
      if (updErr) {
        console.error("Password update error:", updErr);
        return json(500, { error: "Failed to update password" });
      }
      await supabase
        .from("phone_auth_secrets")
        .upsert({ user_id: userId, password }, { onConflict: "user_id" });
    }

    // Sign in
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError || !sessionData?.session) {
      console.error("Session error:", sessionError);
      return json(500, { error: "Login failed" });
    }

    return json(200, {
      success: true,
      session: sessionData.session,
      user: sessionData.user,
      isNewUser: flow === "register",
    });
  } catch (error) {
    console.error("Error:", error);
    return json(500, { error: "Internal error" });
  }
});
