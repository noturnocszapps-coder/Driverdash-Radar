import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { NeighborhoodInsight } from "../types";
import { 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Navigation,
  Filter,
  Search
} from "lucide-react";
import { cn } from "../lib/utils";

const NeighborhoodCard: React.FC<{ insight: NeighborhoodInsight }> = ({ insight }) => (
  <div className="rounded-2xl bg-zinc-900 p-5 border border-zinc-800">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-white">{insight.bairro}</h4>
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{insight.regiao}</p>
        </div>
      </div>
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold text-xs",
        insight.return_score >= 80 ? "border-emerald-500 text-emerald-500" : 
        insight.return_score >= 60 ? "border-yellow-500 text-yellow-500" : "border-rose-500 text-rose-500"
      )}>
        {insight.return_score}
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Valor/KM</p>
        <p className="text-sm font-bold text-white">R$ {insight.avg_value_per_km.toFixed(2)}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Ticket Médio</p>
        <p className="text-sm font-bold text-white">R$ {insight.avg_fare.toFixed(2)}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Volume</p>
        <p className="text-sm font-bold text-white">{insight.total_calls} chamadas</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Lucro Médio</p>
        <p className="text-sm font-bold text-emerald-500">R$ {insight.avg_profit.toFixed(2)}</p>
      </div>
    </div>
  </div>
);

export default function Neighborhoods() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<NeighborhoodInsight[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;
    // Mock data for UI
    setInsights([
      {
        bairro: "Pinheiros",
        regiao: "Zona Oeste",
        app_name: "Uber",
        total_calls: 156,
        accepted_calls: 45,
        refused_calls: 111,
        avg_fare: 28.50,
        avg_total_km: 12.4,
        avg_value_per_km: 2.30,
        avg_value_per_hour: 48.0,
        avg_profit: 18.20,
        return_score: 88,
        uid: user.uid,
        updated_at: new Date().toISOString()
      },
      {
        bairro: "Itaim Bibi",
        regiao: "Zona Sul",
        app_name: "Uber",
        total_calls: 98,
        accepted_calls: 32,
        refused_calls: 66,
        avg_fare: 34.20,
        avg_total_km: 14.2,
        avg_value_per_km: 2.41,
        avg_value_per_hour: 52.0,
        avg_profit: 22.50,
        return_score: 92,
        uid: user.uid,
        updated_at: new Date().toISOString()
      },
      {
        bairro: "Guaianases",
        regiao: "Zona Leste",
        app_name: "Uber",
        total_calls: 45,
        accepted_calls: 5,
        refused_calls: 40,
        avg_fare: 18.50,
        avg_total_km: 15.0,
        avg_value_per_km: 1.23,
        avg_value_per_hour: 28.0,
        avg_profit: 6.20,
        return_score: 35,
        uid: user.uid,
        updated_at: new Date().toISOString()
      }
    ]);
  }, [user]);

  const filteredInsights = insights.filter(i => 
    i.bairro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h2 className="text-sm font-medium text-blue-500 uppercase tracking-widest">Inteligência Geográfica</h2>
        <h1 className="text-3xl font-bold tracking-tight">Bairros e Regiões</h1>
      </section>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar bairro..."
          className="w-full rounded-2xl bg-zinc-900 py-4 pl-12 pr-4 font-medium text-white border border-zinc-800 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {["Todos", "Melhores", "Piores", "Zona Sul", "Zona Oeste", "Zona Leste", "Zona Norte", "Centro"].map((filter) => (
          <button
            key={filter}
            className="whitespace-nowrap rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-400 border border-zinc-800"
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredInsights.map((insight, idx) => (
          <NeighborhoodCard key={idx} insight={insight} />
        ))}
      </div>
    </div>
  );
}
