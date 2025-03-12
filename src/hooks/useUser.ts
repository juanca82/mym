import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { UserProfile } from "../types/database";

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null); 
  const [loading, setLoading] = useState(true);

  // Función para obtener el perfil del usuario desde Supabase
  async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, email, role, full_name, avatar_url, created_at, updated_at")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("❌ Error al obtener perfil:", error);
      return null;
    }

    console.log("✅ Perfil del usuario obtenido:", data);
    return data;
  }

  useEffect(() => {
    async function getUser() {
      setLoading(true);
      try {
        // Obtener el usuario autenticado
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("❌ Error obteniendo usuario autenticado:", error);
          setUser(null);
          setLoading(false);
          return;
        }

        console.log("🔹 Usuario autenticado:", user);

        // Si hay usuario, obtener su perfil
        if (user) {
          const profile = await fetchUserProfile(user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Error en getUser:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getUser();

    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      try {
        console.log("🔄 Cambio en la autenticación:", _event, session);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Error en authListener:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup para evitar fugas de memoria
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
}