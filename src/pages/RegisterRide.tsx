import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { AppName, CompletedRide } from "../types";
import { 
  CheckCircle2, 
  Smartphone, 
  DollarSign, 
  Navigation, 
  Clock, 
  MapPin,
  Save,
  Zap
} from "lucide-react";
import { cn } from "../lib/utils";

export default function RegisterRide() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    app_name: "Uber" as AppName,
    origin_bairro: "",
    destination_bairro: "",
    ride_value: "",
    total_km: "",
    duration_minutes: ""
  });

  const handleSave = async () => {
    if (!user || !formData.ride_value || !formData.total_km) return;
    setLoading(true);
    try {
      const ride: CompletedRide = {
        uid: user.uid,
        app_name: formData.app_name,
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        origin_text: "",
        origin_bairro: formData.origin_bairro,
        destination_text: "",
        destination_bairro: formData.destination_bairro,
        total_km: parseFloat(formData.total_km),
        ride_value: parseFloat(formData.ride_value),
        duration_minutes: parseInt(formData.duration_minutes) || 0,
        estimated_cost: parseFloat(formData.total_km) * 0.65,
        estimated_profit: parseFloat(formData.ride_value) - (parseFloat(formData.total_km) * 0.65),
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, "completed_rides"), ride);
      setFormData({
        app_name: "Uber",
        origin_bairro: "",
        destination_bairro: "",
        ride_value: "",
        total_km: "",
        duration_minutes: ""
      });
      alert("Corrida registrada com sucesso!");
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h2 className="text-sm font-medium text-emerald-500 uppercase tracking-widest">Finalização</h2>
        <h1 className="text-3xl font-bold tracking-tight">Registrar Corrida</h1>
      </section>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {(["Uber", "99", "inDrive", "Particular"] as AppName[]).map((app) => (
            <button
              key={app}
              onClick={() => setFormData({ ...formData, app_name: app })}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border py-4 font-bold transition-all",
                formData.app_name === app 
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-400"
              )}
            >
              <Smartphone className="h-4 w-4" />
              {app}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Valor Final (R$)</label>
            <input
              type="number"
              inputMode="decimal"
              value={formData.ride_value}
              onChange={(e) => setFormData({ ...formData, ride_value: e.target.value })}
              placeholder="0.00"
              className="w-full rounded-2xl bg-zinc-900 p-4 font-bold text-white border border-zinc-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">KM Total</label>
              <input
                type="number"
                inputMode="decimal"
                value={formData.total_km}
                onChange={(e) => setFormData({ ...formData, total_km: e.target.value })}
                placeholder="0.0"
                className="w-full rounded-2xl bg-zinc-900 p-4 font-bold text-white border border-zinc-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Duração (Min)</label>
              <input
                type="number"
                inputMode="numeric"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                placeholder="0"
                className="w-full rounded-2xl bg-zinc-900 p-4 font-bold text-white border border-zinc-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Bairro Origem</label>
              <input
                type="text"
                value={formData.origin_bairro}
                onChange={(e) => setFormData({ ...formData, origin_bairro: e.target.value })}
                placeholder="Ex: Centro"
                className="w-full rounded-2xl bg-zinc-900 p-4 font-bold text-white border border-zinc-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Bairro Destino</label>
              <input
                type="text"
                value={formData.destination_bairro}
                onChange={(e) => setFormData({ ...formData, destination_bairro: e.target.value })}
                placeholder="Ex: Pinheiros"
                className="w-full rounded-2xl bg-zinc-900 p-4 font-bold text-white border border-zinc-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full rounded-3xl bg-emerald-600 py-5 text-lg font-black text-white shadow-xl shadow-emerald-500/20 transition-transform active:scale-95"
        >
          {loading ? "SALVANDO..." : "CONCLUIR CORRIDA"}
        </button>
      </div>
    </div>
  );
}
