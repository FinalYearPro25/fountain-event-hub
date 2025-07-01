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
      const { data: roleData, error: roleError } = await supabase.rpc(
        "get_user_role",
        { _user_id: userId }
      );
      if (roleError) {
        console.error("Error fetching user role:", roleError);
      }

      if (profileData) {
        setProfile({
          ...profileData,
          role: roleData || "student",
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
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return { user, profile, loading, signOut };
};
