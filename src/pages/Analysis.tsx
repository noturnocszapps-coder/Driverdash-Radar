import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { AppName, CallAnalysis, DriverSettings } from "../types";
import { 
  Radar, 
  Smartphone, 
  DollarSign, 
  Navigation, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Save,
  Zap,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { cn } from "../lib/utils";

const ScoreCard = ({ score, recommendation }: { score: number, recommendation: string }) => {
  const getColor = () => {
    if (score < 40) return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    if (score < 60) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    if (score < 75) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    if (score < 90) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    return "text-blue-500 bg-blue-500/10 border-blue-500/20";
  };

  return (
    <div className={cn("flex flex-col items-center justify-center rounded-3xl border p-8 text-center", getColor())}>
      <div className="mb-2 text-6xl font-black tracking-tighter">{score}</div>
      <div className="text-sm font-bold uppercase tracking-widest">{recommendation}</div>
    </div>
  );
};

const ResultItem = ({ label, value, icon: Icon }: any) => (
  <div className="flex items-center justify-between rounded-2xl bg-zinc-900 p-4 border border-zinc-800">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium text-zinc-400">{label}</span>
    </div>
    <span className="text-lg font-bold text-white">{value}</span>
  </div>
);

export default function Analysis() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<DriverSettings | null>(null);
  const [formData, setFormData] = useState({
    app_name: "Uber" as AppName,
    fare_value: "",
    pickup_km: "",
    trip_km: "",
    estimated_minutes: "",
    destination_bairro: ""
  });
  const [result, setResult] = useState<CallAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      const docRef = doc(db, "driver_settings", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as DriverSettings);
      } else {
        // Default settings
        setSettings({
          uid: user.uid,
          city: "",
          minimum_value_per_km: 2.0,
          minimum_value_per_hour: 40.0,
          max_pickup_km: 3.0,
          vehicle_cost_per_km: 0.65,
          preferred_apps: ["Uber", "99"],
          bad_regions: [],
          preferred_regions: [],
          daily_goal: 300,
          updated_at: new Date().toISOString()
        });
      }
    };
    fetchSettings();
  }, [user]);

  const calculate = () => {
    if (!formData.fare_value || !formData.pickup_km || !formData.trip_km || !formData.estimated_minutes) return;

    const fare = parseFloat(formData.fare_value);
    const pickup = parseFloat(formData.pickup_km);
    const trip = parseFloat(formData.trip_km);
    const minutes = parseFloat(formData.estimated_minutes);
    const totalKm = pickup + trip;
    const costPerKm = settings?.vehicle_cost_per_km || 0.65;
    
    const valuePerKm = fare / totalKm;
    const valuePerHour = (fare / minutes) * 60;
    const estimatedCost = totalKm * costPerKm;
    const estimatedProfit = fare - estimatedCost;

    // Score calculation logic
    let score = 0;
    
    // Value per KM (40 points)
    const minKm = settings?.minimum_value_per_km || 2.0;
    if (valuePerKm >= minKm * 1.5) score += 40;
    else if (valuePerKm >= minKm) score += 30;
    else if (valuePerKm >= minKm * 0.8) score += 15;

    // Value per Hour (30 points)
    const minHour = settings?.minimum_value_per_hour || 40.0;
    if (valuePerHour >= minHour * 1.5) score += 30;
    else if (valuePerHour >= minHour) score += 20;
    else if (valuePerHour >= minHour * 0.8) score += 10;

    // Pickup distance (20 points)
    const maxPickup = settings?.max_pickup_km || 3.0;
    if (pickup <= maxPickup * 0.5) score += 20;
    else if (pickup <= maxPickup) score += 15;
    else if (pickup <= maxPickup * 1.5) score += 5;

    // Profitability (10 points)
    if (estimatedProfit > fare * 0.6) score += 10;
    else if (estimatedProfit > fare * 0.4) score += 5;

    let recommendation: CallAnalysis["recommendation"] = "ruim";
    if (score >= 90) recommendation = "excelente";
    else if (score >= 75) recommendation = "boa";
    else if (score >= 60) recommendation = "razoavel";
    else if (score >= 40) recommendation = "fraca";

    const analysis: CallAnalysis = {
      uid: user!.uid,
      app_name: formData.app_name,
      fare_value: fare,
      pickup_km: pickup,
      trip_km: trip,
      total_km: totalKm,
      estimated_minutes: minutes,
      destination_text: "",
      destination_bairro: formData.destination_bairro,
      destination_region: "",
      value_per_km: valuePerKm,
      value_per_hour: valuePerHour,
      estimated_cost: estimatedCost,
      estimated_profit: estimatedProfit,
      ride_score: score,
      recommendation,
      accepted: false,
      created_at: new Date().toISOString()
    };

    setResult(analysis);
  };

  const handleSave = async (accepted: boolean) => {
    if (!result || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "call_analyses"), {
        ...result,
        accepted,
        created_at: new Date().toISOString()
      });
      setResult(null);
      setFormData({
        app_name: "Uber",
        fare_value: "",
        pickup_km: "",
        trip_km: "",
        estimated_minutes: "",
        destination_bairro: ""
      });
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h2 className="text-sm font-medium text-blue-500 uppercase tracking-widest">Radar de Corridas</h2>
        <h1 className="text-3xl font-bold tracking-tight">Análise Rápida</h1>
      </section>

      {!result ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {(["Uber", "99", "inDrive", "Particular"] as AppName[]).map((app) => (
              <button
                key={app}
                onClick={() => setFormData({ ...formData, app_name: app })}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border py-4 font-bold transition-all",
                  formData.app_name === app 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                )}
              >
                <Smartphone className="h-4 w-4" />
                {app}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Valor (R$)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={formData.fare_value}
                  onChange={(e) => setFormData({ ...formData, fare_value: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-2xl bg-zinc-900 p-4 font-bold text-white border border-zinc-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tempo (Min)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={formData.estimated_minutes}
                  onChange={(e) => setFormData({ ...formData, estimated_minutes: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-2xl bg-zinc-900 p-4 font-bold text-white border border-zinc-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">KM Embarque</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={formData.pickup_km}
                  onChange={(e) => setFormData({ ...formData, pickup_km: e.target.value })}
                  placeholder="0.0"
                  className="w-full rounded-2xl bg-zinc-900 p-4 font-bold text-white border border-zinc-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">KM Viagem</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={formData.trip_km}
                  onChange={(e) => setFormData({ ...formData, trip_km: e.target.value })}
                  placeholder="0.0"
                  className="w-full rounded-2xl bg-zinc-900 p-4 font-bold text-white border border-zinc-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Bairro Destino</label>
              <input
                type="text"
                value={formData.destination_bairro}
                onChange={(e) => setFormData({ ...formData, destination_bairro: e.target.value })}
                placeholder="Ex: Pinheiros"
                className="w-full rounded-2xl bg-zinc-900 p-4 font-bold text-white border border-zinc-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={calculate}
            className="w-full rounded-3xl bg-blue-600 py-5 text-lg font-black text-white shadow-xl shadow-blue-500/20 transition-transform active:scale-95"
          >
            ANALISAR AGORA
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <ScoreCard score={result.ride_score} recommendation={result.recommendation} />

          <div className="grid grid-cols-1 gap-3">
            <ResultItem label="Distância Total" value={`${result.total_km.toFixed(1)} km`} icon={Navigation} />
            <ResultItem label="Valor por KM" value={`R$ ${result.value_per_km.toFixed(2)}`} icon={TrendingUp} />
            <ResultItem label="Valor por Hora" value={`R$ ${result.value_per_hour.toFixed(2)}`} icon={Clock} />
            <ResultItem label="Lucro Estimado" value={`R$ ${result.estimated_profit.toFixed(2)}`} icon={DollarSign} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-zinc-900 p-6 font-bold text-rose-500 border border-zinc-800 transition-transform active:scale-95"
            >
              <XCircle className="h-8 w-8" />
              RECUSEI
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-emerald-600 p-6 font-bold text-white shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
            >
              <CheckCircle2 className="h-8 w-8" />
              ACEITEI
            </button>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full py-4 text-sm font-bold text-zinc-500"
          >
            Nova Análise
          </button>
        </div>
      )}
    </div>
  );
}
