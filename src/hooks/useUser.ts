import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/database';

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session Error:", sessionError);
        }

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile Fetch Error:", profileError);
          }

          if (profile) {
            setUser(profile);
          } else {
            console.warn("No profile found for user ID:", session.user.id);
          }
        }
      } catch (error) {
        console.error("Unexpected Error in useUser:", error);
      } finally {
        setLoading(false); // 👈 Garantiza que loading siempre se actualice
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile Fetch Error (Auth Change):", profileError);
        }

        setUser(profile || null);
      } else {
        setUser(null);
      }
      setLoading(false); // 👈 Asegura que loading cambie tras auth
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}