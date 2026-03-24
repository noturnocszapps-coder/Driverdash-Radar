import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { DriverSettings, AppName } from "../types";
import { 
  Settings, 
  DollarSign, 
  Navigation, 
  Clock, 
  Smartphone, 
  MapPin,
  Save,
  Target
} from "lucide-react";
import { cn } from "../lib/utils";

const SettingItem = ({ label, value, onChange, type = "number", step = "0.1", icon: Icon, suffix }: any) => (
  <div className="flex items-center justify-between rounded-2xl bg-zinc-900 p-4 border border-zinc-800">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium text-zinc-400">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 rounded-lg bg-zinc-800 p-2 text-right font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {suffix && <span className="text-xs font-bold text-zinc-500">{suffix}</span>}
    </div>
  </div>
);

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<DriverSettings>({
    uid: "",
    city: "São Paulo",
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

  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      const docRef = doc(db, "driver_settings", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as DriverSettings);
      } else {
        setSettings(prev => ({ ...prev, uid: user.uid }));
      }
    };
    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "driver_settings", user.uid), {
        ...settings,
        updated_at: new Date().toISOString()
      });
      alert("Configurações salvas!");
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h2 className="text-sm font-medium text-blue-500 uppercase tracking-widest">Personalização</h2>
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
      </section>

      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Metas e Limites</h3>
          <SettingItem 
            label="Valor Mínimo / KM" 
            value={settings.minimum_value_per_km} 
            onChange={(v: string) => setSettings({ ...settings, minimum_value_per_km: parseFloat(v) })}
            icon={Navigation}
            suffix="R$"
          />
          <SettingItem 
            label="Valor Mínimo / Hora" 
            value={settings.minimum_value_per_hour} 
            onChange={(v: string) => setSettings({ ...settings, minimum_value_per_hour: parseFloat(v) })}
            icon={Clock}
            suffix="R$"
          />
          <SettingItem 
            label="Meta Diária" 
            value={settings.daily_goal} 
            onChange={(v: string) => setSettings({ ...settings, daily_goal: parseFloat(v) })}
            icon={Target}
            suffix="R$"
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Custos do Veículo</h3>
          <SettingItem 
            label="Custo por KM" 
            value={settings.vehicle_cost_per_km} 
            onChange={(v: string) => setSettings({ ...settings, vehicle_cost_per_km: parseFloat(v) })}
            icon={DollarSign}
            suffix="R$"
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Apps Preferidos</h3>
          <div className="grid grid-cols-2 gap-3">
            {(["Uber", "99", "inDrive", "Particular"] as AppName[]).map((app) => (
              <button
                key={app}
                onClick={() => {
                  const apps = settings.preferred_apps.includes(app)
                    ? settings.preferred_apps.filter(a => a !== app)
                    : [...settings.preferred_apps, app];
                  setSettings({ ...settings, preferred_apps: apps });
                }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition-all",
                  settings.preferred_apps.includes(app)
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500"
                )}
              >
                {app}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full rounded-3xl bg-blue-600 py-5 text-lg font-black text-white shadow-xl shadow-blue-500/20 transition-transform active:scale-95"
        >
          {loading ? "SALVANDO..." : "SALVAR AJUSTES"}
        </button>
      </div>
    </div>
  );
}
