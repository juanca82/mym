import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "../hooks/useUser";
import { Loader, Clock, Coffee, LogOut } from "lucide-react";
import Navigation from "../components/Navigation.tsx";

interface TimeEntry {
  id: string;
  check_in: string | null;
  break_start: string | null;
  check_out: string | null;
  total_hours: number | null;
  created_at: string;
}

export default function TimeClock() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<TimeEntry | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    if (user) fetchTodayEntry();
  }, [user]);

  async function fetchTodayEntry() {
    setLoading(true);

    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .eq("user_id", user?.id)
      .gte("check_in", new Date().toISOString().split("T")[0]) // Solo registros de hoy
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!error) {
      setEntry(data);
    } else {
      setEntry(null); // Permitir nuevo fichaje si no hay entrada hoy
    }

    setLoading(false);
  }

  async function handleAction(action: "checkIn" | "breakStart" | "checkOut") {
    if (!user || buttonLoading) return;
    setButtonLoading(true);

    let updateData: any = {};

    if (action === "checkIn") {
      updateData = { user_id: user.id, check_in: new Date().toISOString() };
    } else if (action === "breakStart" && entry) {
      updateData = { break_start: new Date().toISOString() }; // Solo informativo
    } else if (action === "checkOut" && entry) {
      const checkInTime = new Date(entry.check_in!);
      const checkOutTime = new Date();
      const totalHours = ((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(2);

      updateData = { 
        check_out: checkOutTime.toISOString(),
        total_hours: parseFloat(totalHours) // Solo calculamos check_in → check_out
      };
    }

    const { data, error } = action === "checkIn"
      ? await supabase.from("time_entries").insert([updateData]).select().single()
      : await supabase.from("time_entries").update(updateData).eq("id", entry?.id).select().single();

    if (!error) setEntry(data);
    setButtonLoading(false);
  }

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-700 text-center">⏰ Control de Horario</h2>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader className="animate-spin text-gray-500" size={32} />
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-6 border rounded-lg shadow-sm bg-gray-50 text-center">
                  <Clock className="mx-auto text-blue-600" size={40} />
                  <p className="font-semibold mt-2 text-gray-700">Entrada</p>
                  <p className="text-gray-500">{entry?.check_in ? new Date(entry.check_in).toLocaleTimeString() : "No fichado"}</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-gray-50 text-center">
                  <Coffee className="mx-auto text-yellow-500" size={40} />
                  <p className="font-semibold mt-2 text-gray-700">Descanso</p>
                  <p className="text-gray-500">{entry?.break_start ? new Date(entry.break_start).toLocaleTimeString() : "No fichado"}</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-gray-50 text-center">
                  <LogOut className="mx-auto text-red-600" size={40} />
                  <p className="font-semibold mt-2 text-gray-700">Salida</p>
                  <p className="text-gray-500">{entry?.check_out ? new Date(entry.check_out).toLocaleTimeString() : "No fichado"}</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-gray-50 text-center">
                  <Clock className="mx-auto text-green-600" size={40} />
                  <p className="font-semibold mt-2 text-gray-700">Total Horas</p>
                  <p className="text-gray-500">{entry ? (entry.total_hours !== null ? `${entry.total_hours} hrs` : "No calculado") : "No calculado"}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {!entry?.check_in && (
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full transition-all"
                    onClick={() => handleAction("checkIn")}
                    disabled={buttonLoading}
                  >
                    {buttonLoading ? "Fichando..." : "🕒 Fichar Entrada"}
                  </button>
                )}
                {entry?.check_in && !entry.break_start && (
                  <button 
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg w-full transition-all"
                    onClick={() => handleAction("breakStart")}
                    disabled={buttonLoading}
                  >
                    {buttonLoading ? "Fichando..." : "☕ Fichar Descanso"}
                  </button>
                )}
                {entry?.check_in && !entry.check_out && (
                  <button 
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg w-full transition-all"
                    onClick={() => handleAction("checkOut")}
                    disabled={buttonLoading}
                  >
                    {buttonLoading ? "Fichando..." : "🚪 Fichar Salida"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}