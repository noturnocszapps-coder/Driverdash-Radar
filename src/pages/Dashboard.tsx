import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { CallAnalysis, CompletedRide } from "../types";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MapPin, 
  Smartphone,
  ChevronRight,
  Zap,
  LayoutDashboard
} from "lucide-react";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";

const StatCard = ({ label, value, subValue, icon: Icon, trend }: any) => (
  <div className="rounded-2xl bg-zinc-900 p-5 border border-zinc-800 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
        <Icon className="h-5 w-5" />
      </div>
      {trend !== undefined && (
        <span className={cn(
          "flex items-center gap-1 text-xs font-bold",
          trend > 0 ? "text-emerald-500" : "text-rose-500"
        )}>
          {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      {subValue && <p className="text-xs text-zinc-400">{subValue}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user, isLocalMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCalls: 0,
    acceptedCalls: 0,
    refusedCalls: 0,
    acceptanceRate: 0,
    avgTicket: 0,
    avgKmValue: 0,
    bestBairro: "---",
    bestApp: "---"
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      let analyses: CallAnalysis[] = [];

      try {
        if (isLocalMode || !db || !user) {
          analyses = JSON.parse(localStorage.getItem("call_analyses") || "[]");
        } else {
          const q = query(
            collection(db, "call_analyses"),
            where("uid", "==", user.uid),
            orderBy("created_at", "desc"),
            limit(100)
          );
          const querySnapshot = await getDocs(q);
          analyses = querySnapshot.docs.map(doc => doc.data() as CallAnalysis);
        }

        if (analyses.length > 0) {
          const total = analyses.length;
          const accepted = analyses.filter(a => a.accepted).length;
          const refused = total - accepted;
          const rate = Math.round((accepted / total) * 100);
          
          const avgTicket = analyses.reduce((acc, curr) => acc + curr.fare_value, 0) / total;
          const avgKm = analyses.reduce((acc, curr) => acc + curr.value_per_km, 0) / total;

          // Find best app
          const appCounts: Record<string, number> = {};
          analyses.forEach(a => {
            if (a.accepted) appCounts[a.app_name] = (appCounts[a.app_name] || 0) + 1;
          });
          const bestApp = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "---";

          // Find best bairro
          const bairroCounts: Record<string, number> = {};
          analyses.forEach(a => {
            if (a.accepted && a.destination_bairro) {
              bairroCounts[a.destination_bairro] = (bairroCounts[a.destination_bairro] || 0) + 1;
            }
          });
          const bestBairro = Object.entries(bairroCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "---";

          setStats({
            totalCalls: total,
            acceptedCalls: accepted,
            refusedCalls: refused,
            acceptanceRate: rate,
            avgTicket,
            avgKmValue: avgKm,
            bestBairro,
            bestApp
          });
        }
      } catch (error) {
        console.error("Fetch Stats Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, isLocalMode]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="space-y-1">
        <h2 className="text-sm font-medium text-blue-500 uppercase tracking-widest">Resumo Operacional</h2>
        <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.displayName?.split(' ')[0] || 'Motorista'}</h1>
      </section>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <StatCard 
          label="Chamadas" 
          value={stats.totalCalls} 
          subValue={`${stats.acceptedCalls} aceitas`}
          icon={Smartphone}
        />
        <StatCard 
          label="Taxa Aceite" 
          value={`${stats.acceptanceRate}%`} 
          subValue="Últimas 24h"
          icon={Zap}
          trend={-5}
        />
        <StatCard 
          label="Valor/KM" 
          value={`R$ ${stats.avgKmValue.toFixed(2)}`} 
          subValue="Média do dia"
          icon={TrendingUp}
          trend={12}
        />
        <StatCard 
          label="Ticket Médio" 
          value={`R$ ${stats.avgTicket.toFixed(2)}`} 
          subValue="Por corrida"
          icon={DollarSign}
        />
      </section>

      {/* Insights Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Insights do Dia</h3>
          <button className="text-xs font-semibold text-blue-500">Ver todos</button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-zinc-900 p-4 border border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500">Melhor Bairro</p>
                <p className="font-bold">{stats.bestBairro}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-600" />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-zinc-900 p-4 border border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500">Melhor App</p>
                <p className="font-bold">{stats.bestApp}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-600" />
          </div>
        </div>
      </section>

      {/* Quick Action */}
      <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 shadow-xl shadow-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Radar Ativo</h3>
            <p className="text-sm text-blue-100">Analise sua próxima chamada agora.</p>
          </div>
          <Zap className="h-10 w-10 text-white/50" />
        </div>
        <Link to="/radar" className="mt-6 block w-full text-center rounded-xl bg-white py-4 font-bold text-blue-700 transition-transform active:scale-95">
          Nova Análise
        </Link>
      </section>
    </div>
  );
}
