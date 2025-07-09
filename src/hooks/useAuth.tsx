import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  user_type: "student" | "staff" | "outsider";
  student_id?: string;
  staff_id?: string;
  college_id?: string;
  department?: string;
  year_of_study?: number;
  role?:
    | "super_admin"
    | "senate_member"
    | "dean"
    | "dean_student_affairs"
    | "department_head"
    | "event_coordinator"
    | "student"
    | "staff"
    | "outsider";
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      // Fetch the highest role using the Supabase function
      let userRole = null;
      const { data: roleData, error: roleError } = await supabase.rpc(
        "get_user_role",
        { _user_id: userId }
      );
      if (roleError || !roleData) {
        // Fallback: fetch from user_roles table
        const { data: userRoles, error: userRolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .single();
        if (!userRolesError && userRoles) {
          userRole = userRoles.role;
        }
      } else {
        userRole = roleData;
      }
      if (profileData) {
        setProfile({
          ...profileData,
          role: userRole || "student",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        // Defer profile fetching to avoid blocking
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      window.location.href = "/"; // Force redirect to home after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return { user, profile, loading, signOut };
};
