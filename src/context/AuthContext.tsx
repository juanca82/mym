import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Definir la estructura del contexto de autenticación
interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

// Crear un contexto con valores iniciales
const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

// El componente AuthProvider es el encargado de manejar la autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para obtener la sesión actual de Supabase
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);  // Actualizamos el estado con la sesión obtenida
        setLoading(false);    // Cambiamos el estado de carga a false una vez obtenida la sesión
      } catch (error) {
        console.error("Error al obtener la sesión:", error);
        setLoading(false); // Asegurarnos de que el estado de carga se actualiza
      }
    };

    // Llamamos a la función para obtener la sesión al montar el componente
    fetchSession();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);  // Actualizamos la sesión cuando cambia el estado de autenticación
    });

    // Limpiar la suscripción al desmontar el componente
    return () => subscription.unsubscribe();
  }, []);  // El efecto se ejecuta solo una vez, al montar el componente

  // Proveemos el contexto con la sesión y el estado de carga
  return (
    <AuthContext.Provider value={{ session, loading }}>
      {/* Solo renderizamos los hijos cuando la sesión está cargada */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook para acceder al contexto de autenticación desde otros componentes
export const useAuth = () => {
  return useContext(AuthContext);
};