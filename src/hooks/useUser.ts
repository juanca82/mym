// useUser.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { UserProfile } from "../types/database";

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, email, role, full_name, avatar_url, created_at, updated_at")
      .eq("id", userId)
      .single(); // 'maybeSingle' te puede dar resultados nulos, usa 'single' para obtener uno solo o nulo

    if (error) {
      console.error("Error al obtener perfil:", error);
      return null;
    }

    return data;
  }

  useEffect(() => {
    async function getUser() {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error de sesión:", error);
          setUser(null);
          setLoading(false);
          return;
        }

        if (data.session?.user) {
          const profile = await fetchUserProfile(data.session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error en getUser:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      try {
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error en el authListener:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
}