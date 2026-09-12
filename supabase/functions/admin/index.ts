import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Authorization token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "getUsers") {
      const { data: users, error: usersError } = await adminClient.auth.admin.listUsers();
      if (usersError) throw usersError;

      const { data: profiles, error: profilesError } = await adminClient
        .from("profiles")
        .select("id, full_name, role, created_at");
      if (profilesError) throw profilesError;

      const profileById = new Map((profiles || []).map(profile => [profile.id, profile]));
      const data = (users?.users || []).map(authUser => ({
        id: authUser.id,
        email: authUser.email,
        full_name: profileById.get(authUser.id)?.full_name || authUser.user_metadata?.full_name || null,
        role: profileById.get(authUser.id)?.role || "reader",
        created_at: profileById.get(authUser.id)?.created_at || authUser.created_at
      }));

      return new Response(JSON.stringify({ data }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (action === "updateUserRole") {
      const { id, role } = body;
      if (!id || !["reader", "admin"].includes(role)) {
        return new Response(JSON.stringify({ error: "Missing id or valid role" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (id === user.id && role !== "admin") {
        return new Response(JSON.stringify({ error: "You cannot remove your own admin access" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const { data, error } = await adminClient
        .from("profiles")
        .update({ role })
        .eq("id", id)
        .select("id, full_name, role, created_at")
        .single();
      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (action === "getSubmissions") {
      const { data, error } = await adminClient
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (action === "getVolunteers") {
      const { data, error } = await adminClient
        .from("volunteers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (action === "getContactMessages") {
      const { data, error } = await adminClient
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (action === "getDonations") {
      const { data, error } = await adminClient
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (action === "updateSubmissionStatus") {
      const { id, status } = body;
      if (!id || !status) {
        return new Response(JSON.stringify({ error: "Missing id or status" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const { data, error } = await adminClient
        .from("submissions")
        .update({ status })
        .eq("id", id)
        .select();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (action === "setContentItemPublished") {
      const { id, published } = body;
      if (!id || typeof published !== "boolean") {
        return new Response(JSON.stringify({ error: "Missing id or published boolean" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const { data, error } = await adminClient
        .from("content_items")
        .update({ published, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
