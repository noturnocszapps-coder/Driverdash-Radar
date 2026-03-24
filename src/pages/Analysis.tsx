import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { AppName, CallAnalysis, DriverSettings } from "../types";
import { 
  Smartphone, 
  DollarSign, 
  Navigation, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Plus,
  Minus,
  Zap,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

const PRESETS = [
  { label: "Curta", km: 3, min: 8, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { label: "Média", km: 6, min: 15, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { label: "Longa", km: 10, min: 25, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
];

const Stepper = ({ value, onChange, step, min = 0, label, icon: Icon }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{label}</label>
    <div className="flex items-center justify-between rounded-2xl bg-zinc-900 p-1 border border-zinc-800">
      <button 
        onClick={() => onChange(Math.max(min, value - step))}
        className="flex h-12 w-12 items-center justify-center rounded-xl text-zinc-400 active:bg-zinc-800 active:scale-90 transition-all"
      >
        <Minus className="h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center justify-center gap-2">
        <Icon className="h-4 w-4 text-zinc-600" />
        <span className="text-lg font-black text-white">{value % 1 === 0 ? value : value.toFixed(1)}</span>
      </div>
      <button 
        onClick={() => onChange(value + step)}
        className="flex h-12 w-12 items-center justify-center rounded-xl text-zinc-400 active:bg-zinc-800 active:scale-90 transition-all"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  </div>
);

const ScoreDisplay = ({ score, recommendation }: { score: number, recommendation: string }) => {
  const getColor = () => {
    if (score < 40) return "text-rose-500";
    if (score < 60) return "text-orange-500";
    if (score < 75) return "text-yellow-500";
    if (score < 90) return "text-emerald-500";
    return "text-blue-500";
  };

  const getBg = () => {
    if (score < 40) return "bg-rose-500/10 border-rose-500/20";
    if (score < 60) return "bg-orange-500/10 border-orange-500/20";
    if (score < 75) return "bg-yellow-500/10 border-yellow-500/20";
    if (score < 90) return "bg-emerald-500/10 border-emerald-500/20";
    return "bg-blue-500/10 border-blue-500/20";
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("flex flex-col items-center justify-center rounded-3xl border p-6 text-center transition-colors duration-500", getBg())}
    >
      <div className={cn("text-7xl font-black tracking-tighter transition-colors duration-500", getColor())}>
        {score}
      </div>
      <div className={cn("text-xs font-black uppercase tracking-[0.2em] mt-1 transition-colors duration-500", getColor())}>
        {recommendation}
      </div>
    </motion.div>
  );
};

export default function Analysis() {
  const { user, isLocalMode } = useAuth();
  const [settings, setSettings] = useState<DriverSettings | null>(null);
  const [appName, setAppName] = useState<AppName>("Uber");
  const [fareValue, setFareValue] = useState("");
  const [pickupKm, setPickupKm] = useState(1.0);
  const [tripKm, setTripKm] = useState(5.0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [destinationBairro, setDestinationBairro] = useState("");
  const [result, setResult] = useState<CallAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (isLocalMode || !db || !user) {
        const localSettings = localStorage.getItem("driver_settings");
        if (localSettings) setSettings(JSON.parse(localSettings));
        return;
      }
      
      const docRef = doc(db, "driver_settings", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as DriverSettings);
      }
    };
    fetchSettings();

    const saved = localStorage.getItem(`last_analysis_${user?.uid || "local"}`);
    if (saved) {
      const data = JSON.parse(saved);
      setAppName(data.app_name || "Uber");
      setPickupKm(data.pickup_km || 1.0);
      setTripKm(data.trip_km || 5.0);
      setEstimatedMinutes(data.estimated_minutes || 15);
    } else {
      // Time-based defaults
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 10) { // Morning rush
        setPickupKm(1.5);
        setTripKm(12.0);
        setEstimatedMinutes(35);
      } else if (hour >= 17 && hour < 20) { // Afternoon rush
        setPickupKm(2.0);
        setTripKm(8.0);
        setEstimatedMinutes(30);
      } else if (hour >= 22 || hour < 4) { // Night
        setPickupKm(1.0);
        setTripKm(6.0);
        setEstimatedMinutes(12);
      }
    }

    // Auto-focus on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [user]);

  // Real-time calculation
  useEffect(() => {
    if (!fareValue || isNaN(parseFloat(fareValue))) {
      setResult(null);
      return;
    }

    const fare = parseFloat(fareValue);
    const totalKm = pickupKm + tripKm;
    const minutes = estimatedMinutes || (totalKm * 2.5); // Ultra-fast estimation if minutes is 0
    const costPerKm = settings?.vehicle_cost_per_km || 0.65;
    
    const valuePerKm = fare / totalKm;
    const valuePerHour = (fare / minutes) * 60;
    const estimatedCost = totalKm * costPerKm;
    const estimatedProfit = fare - estimatedCost;

    let score = 0;
    const minKm = settings?.minimum_value_per_km || 2.0;
    if (valuePerKm >= minKm * 1.5) score += 40;
    else if (valuePerKm >= minKm) score += 30;
    else if (valuePerKm >= minKm * 0.8) score += 15;

    const minHour = settings?.minimum_value_per_hour || 40.0;
    if (valuePerHour >= minHour * 1.5) score += 30;
    else if (valuePerHour >= minHour) score += 20;
    else if (valuePerHour >= minHour * 0.8) score += 10;

    const maxPickup = settings?.max_pickup_km || 3.0;
    if (pickupKm <= maxPickup * 0.5) score += 20;
    else if (pickupKm <= maxPickup) score += 15;
    else if (pickupKm <= maxPickup * 1.5) score += 5;

    if (estimatedProfit > fare * 0.6) score += 10;
    else if (estimatedProfit > fare * 0.4) score += 5;

    let recommendation: CallAnalysis["recommendation"] = "ruim";
    if (score >= 90) recommendation = "excelente";
    else if (score >= 75) recommendation = "boa";
    else if (score >= 60) recommendation = "razoavel";
    else if (score >= 40) recommendation = "fraca";

    const analysis: CallAnalysis = {
      uid: user?.uid || "local",
      app_name: appName,
      fare_value: fare,
      pickup_km: pickupKm,
      trip_km: tripKm,
      total_km: totalKm,
      estimated_minutes: minutes,
      destination_text: "",
      destination_bairro: destinationBairro,
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

    // Persist state
    localStorage.setItem(`last_analysis_${user?.uid || "local"}`, JSON.stringify({
      app_name: appName,
      pickup_km: pickupKm,
      trip_km: tripKm,
      estimated_minutes: minutes
    }));

    // Haptic feedback (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [fareValue, pickupKm, tripKm, estimatedMinutes, appName, destinationBairro, settings, user]);

  const handleSave = async (accepted: boolean) => {
    if (!result) return;
    if (!user && !isLocalMode) return;
    
    setLoading(true);
    const finalResult = {
      ...result,
      accepted,
      created_at: new Date().toISOString()
    };

    try {
      if (isLocalMode || !db) {
        const history = JSON.parse(localStorage.getItem("call_analyses") || "[]");
        history.push(finalResult);
        localStorage.setItem("call_analyses", JSON.stringify(history));
      } else {
        await addDoc(collection(db, "call_analyses"), finalResult);
      }
      setFareValue("");
      setDestinationBairro("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTripKm(preset.km);
    setEstimatedMinutes(preset.min);
    if ('vibrate' in navigator) navigator.vibrate(20);
  };

  const getRegionReturn = (bairro: string) => {
    const b = bairro.toLowerCase();
    if (b.includes("pinheiros") || b.includes("itaim") || b.includes("jardins")) return { label: "Bom", color: "text-emerald-500" };
    if (b.includes("centro") || b.includes("paulista")) return { label: "Médio", color: "text-yellow-500" };
    if (b.includes("guaianases") || b.includes("grajaú")) return { label: "Ruim", color: "text-rose-500" };
    return null;
  };
  const regionReturn = getRegionReturn(destinationBairro);

  return (
    <form 
      onSubmit={(e) => e.preventDefault()}
      className="space-y-6 max-w-md mx-auto"
    >
      {/* App Selector - Compact */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(["Uber", "99", "inDrive", "Particular"] as AppName[]).map((app) => (
          <button
            key={app}
            type="button"
            onClick={() => setAppName(app)}
            className={cn(
              "whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold border transition-all active:scale-95",
              appName === app 
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "bg-zinc-900 border-zinc-800 text-zinc-500"
            )}
          >
            {app}
          </button>
        ))}
      </div>

      {/* Main Value Input - Massive */}
      <div className="relative flex flex-col items-center justify-center py-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-700">R$</span>
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          value={fareValue}
          onChange={(e) => setFareValue(e.target.value)}
          placeholder="0.00"
          className="w-full bg-transparent text-center text-8xl font-black tracking-tighter text-white placeholder:text-zinc-900 focus:outline-none"
        />
        <p className="mt-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Valor da Chamada</p>
      </div>

      {/* Presets - Quick Taps */}
      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className={cn("flex flex-col items-center justify-center rounded-2xl border py-3 transition-all active:scale-90", p.color)}
          >
            <span className="text-[10px] font-black uppercase tracking-wider">{p.label}</span>
            <span className="text-xs font-bold opacity-70">{p.km}km • {p.min}m</span>
          </button>
        ))}
      </div>

      {/* Steppers - Precise Control */}
      <div className="grid grid-cols-2 gap-4">
        <Stepper 
          label="Embarque (KM)" 
          value={pickupKm} 
          onChange={setPickupKm} 
          step={0.5} 
          icon={Navigation}
        />
        <Stepper 
          label="Viagem (KM)" 
          value={tripKm} 
          onChange={setTripKm} 
          step={1} 
          icon={Navigation}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Stepper 
          label="Tempo (Min)" 
          value={estimatedMinutes} 
          onChange={setEstimatedMinutes} 
          step={5} 
          icon={Clock}
        />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Destino (Bairro)</label>
              {regionReturn && (
                <span className={cn("text-[10px] font-black uppercase tracking-widest", regionReturn.color)}>
                  Retorno: {regionReturn.label}
                </span>
              )}
            </div>
            <div className="flex items-center rounded-2xl bg-zinc-900 p-1 border border-zinc-800 h-[58px]">
            <MapPin className="ml-3 h-4 w-4 text-zinc-600" />
            <input
              type="text"
              value={destinationBairro}
              onChange={(e) => setDestinationBairro(e.target.value)}
              placeholder="Opcional"
              className="w-full bg-transparent px-3 text-sm font-bold text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Result Area - Instant Feedback */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <ScoreDisplay score={result.ride_score} recommendation={result.recommendation} />
            
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-zinc-900 p-4 border border-zinc-800 text-center">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Valor / KM</p>
                <p className="text-xl font-black text-white">R$ {result.value_per_km.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl bg-zinc-900 p-4 border border-zinc-800 text-center">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Valor / Hora</p>
                <p className="text-xl font-black text-white">R$ {result.value_per_hour.toFixed(0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={loading}
                className="flex items-center justify-center gap-3 rounded-3xl bg-zinc-900 py-6 font-black text-rose-500 border border-zinc-800 active:scale-95 transition-all"
              >
                <XCircle className="h-6 w-6" />
                RECUSEI
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={loading}
                className="flex items-center justify-center gap-3 rounded-3xl bg-emerald-600 py-6 font-black text-white shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <CheckCircle2 className="h-6 w-6" />
                ACEITEI
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ultra Fast Mode Indicator */}
      {!result && (
        <div className="flex items-center justify-center gap-2 py-4 text-zinc-700">
          <Zap className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Radar Pronto</span>
        </div>
      )}
    </form>
  );
}
