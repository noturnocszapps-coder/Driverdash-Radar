import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { NeighborhoodInsight, CallAnalysis } from "../types";
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
  const { user, isLocalMode } = useAuth();
  const [insights, setInsights] = useState<NeighborhoodInsight[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        if (isLocalMode || !db || !user) {
          // In local mode, we can generate insights from local analyses
          const analyses: CallAnalysis[] = JSON.parse(localStorage.getItem("call_analyses") || "[]");
          const neighborhoodData: Record<string, CallAnalysis[]> = {};
          
          analyses.forEach(a => {
            if (a.destination_bairro) {
              if (!neighborhoodData[a.destination_bairro]) neighborhoodData[a.destination_bairro] = [];
              neighborhoodData[a.destination_bairro].push(a);
            }
          });

          const localInsights: NeighborhoodInsight[] = Object.entries(neighborhoodData).map(([bairro, data]) => {
            const total = data.length;
            const accepted = data.filter(d => d.accepted).length;
            const avgFare = data.reduce((acc, curr) => acc + curr.fare_value, 0) / total;
            const avgKm = data.reduce((acc, curr) => acc + curr.total_km, 0) / total;
            const avgValueKm = data.reduce((acc, curr) => acc + curr.value_per_km, 0) / total;
            
            return {
              bairro,
              regiao: "Local",
              app_name: data[0].app_name,
              total_calls: total,
              accepted_calls: accepted,
              refused_calls: total - accepted,
              avg_fare: avgFare,
              avg_total_km: avgKm,
              avg_value_per_km: avgValueKm,
              avg_value_per_hour: 0,
              avg_profit: 0,
              return_score: Math.min(100, Math.round((accepted / total) * 100 + (avgValueKm * 10))),
              uid: "local",
              updated_at: new Date().toISOString()
            };
          });

          setInsights(localInsights);
        } else {
          const q = query(
            collection(db, "neighborhood_insights"),
            where("uid", "==", user.uid),
            orderBy("updated_at", "desc")
          );
          const querySnapshot = await getDocs(q);
          setInsights(querySnapshot.docs.map(doc => doc.data() as NeighborhoodInsight));
        }
      } catch (error) {
        console.error("Fetch Insights Error:", error);
      }
    };

    fetchInsights();
  }, [user, isLocalMode]);

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
