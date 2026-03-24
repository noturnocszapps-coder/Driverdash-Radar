import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { CallAnalysis, CompletedRide } from "../types";
import { 
  History, 
  Search, 
  Filter, 
  Smartphone, 
  DollarSign, 
  Navigation,
  CheckCircle2,
  XCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HistoryPage() {
  const { user, isLocalMode } = useAuth();
  const [activeTab, setActiveTab] = useState<"analyses" | "completed">("analyses");
  const [analyses, setAnalyses] = useState<CallAnalysis[]>([]);
  const [completed, setCompleted] = useState<CompletedRide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isLocalMode || !db || !user) {
          const localAnalyses = JSON.parse(localStorage.getItem("call_analyses") || "[]");
          const localCompleted = JSON.parse(localStorage.getItem("completed_rides") || "[]");
          setAnalyses(localAnalyses.reverse());
          setCompleted(localCompleted.reverse());
        } else {
          const analysesQuery = query(
            collection(db, "call_analyses"),
            where("uid", "==", user.uid),
            orderBy("created_at", "desc"),
            limit(50)
          );
          const analysesSnap = await getDocs(analysesQuery);
          setAnalyses(analysesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CallAnalysis)));

          const completedQuery = query(
            collection(db, "completed_rides"),
            where("uid", "==", user.uid),
            orderBy("created_at", "desc"),
            limit(50)
          );
          const completedSnap = await getDocs(completedQuery);
          setCompleted(completedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompletedRide)));
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isLocalMode]);

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h2 className="text-sm font-medium text-blue-500 uppercase tracking-widest">Relatórios</h2>
        <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
      </section>

      <div className="flex rounded-2xl bg-zinc-900 p-1 border border-zinc-800">
        <button
          onClick={() => setActiveTab("analyses")}
          className={cn(
            "flex-1 rounded-xl py-3 text-sm font-bold transition-all",
            activeTab === "analyses" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500"
          )}
        >
          Análises
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={cn(
            "flex-1 rounded-xl py-3 text-sm font-bold transition-all",
            activeTab === "completed" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500"
          )}
        >
          Concluídas
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === "analyses" ? (
          analyses.length > 0 ? (
            analyses.map((item) => (
              <div key={item.id} className="rounded-2xl bg-zinc-900 p-4 border border-zinc-800">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{item.app_name}</span>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-500">
                    {format(new Date(item.created_at), "HH:mm '•' dd MMM", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">R$ {item.fare_value.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">{item.destination_bairro || "Destino não informado"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">{item.ride_score} pts</p>
                      <p className={cn(
                        "text-[10px] font-bold uppercase",
                        item.accepted ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {item.accepted ? "Aceita" : "Recusada"}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-700" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-zinc-500">Nenhuma análise encontrada.</div>
          )
        ) : (
          completed.length > 0 ? (
            completed.map((item) => (
              <div key={item.id} className="rounded-2xl bg-zinc-900 p-4 border border-zinc-800">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{item.app_name}</span>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-500">
                    {format(new Date(item.created_at), "HH:mm '•' dd MMM", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">R$ {item.ride_value.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">{item.destination_bairro || "Destino não informado"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-500">+ R$ {item.estimated_profit.toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-zinc-500">{item.total_km} km</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-zinc-500">Nenhuma corrida registrada.</div>
          )
        )}
      </div>
    </div>
  );
}
