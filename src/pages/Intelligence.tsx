import React from "react";
import { 
  BrainCircuit, 
  Clock, 
  MapPin, 
  Smartphone, 
  AlertTriangle,
  Zap,
  ChevronRight,
  TrendingUp
} from "lucide-react";

const InsightCard = ({ title, value, description, icon: Icon, color }: any) => (
  <div className="rounded-2xl bg-zinc-900 p-5 border border-zinc-800">
    <div className="mb-4 flex items-center justify-between">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${color}-500/10 text-${color}-500`}>
        <Icon className="h-5 w-5" />
      </div>
      <Zap className="h-4 w-4 text-zinc-700" />
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
      <h4 className="text-lg font-bold text-white">{value}</h4>
      <p className="text-xs text-zinc-400">{description}</p>
    </div>
  </div>
);

export default function Intelligence() {
  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h2 className="text-sm font-medium text-blue-500 uppercase tracking-widest">Análise de Dados</h2>
        <h1 className="text-3xl font-bold tracking-tight">Inteligência Operacional</h1>
      </section>

      <div className="grid grid-cols-1 gap-4">
        <InsightCard 
          title="Melhor App por Horário"
          value="Uber (17h - 20h)"
          description="Ticket médio 15% superior à 99 neste período."
          icon={Clock}
          color="blue"
        />
        <InsightCard 
          title="Bairro Mais Lucrativo"
          value="Vila Olímpia"
          description="Média de R$ 2.85 por KM nas últimas 48h."
          icon={MapPin}
          color="emerald"
        />
        <InsightCard 
          title="Alerta de Eficiência"
          value="Evite Zona Leste"
          description="Tempo de deslocamento subiu 22% hoje."
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Horários Premium</h3>
        <div className="space-y-3">
          {[
            { time: "06:00 - 09:00", status: "Alta Demanda", score: 92 },
            { time: "11:30 - 13:30", status: "Moderado", score: 65 },
            { time: "17:00 - 20:00", status: "Pico Máximo", score: 98 },
            { time: "22:00 - 01:00", status: "Baixa Demanda", score: 40 },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-2xl bg-zinc-900 p-4 border border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-white">{item.time}</div>
                <div className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                  item.score > 80 ? "bg-emerald-500/10 text-emerald-500" :
                  item.score > 60 ? "bg-yellow-500/10 text-yellow-500" : "bg-rose-500/10 text-rose-500"
                }`}>
                  {item.status}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500">{item.score}%</span>
                <ChevronRight className="h-4 w-4 text-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-zinc-900 p-6 border border-zinc-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Insight IA</h3>
        </div>
        <p className="text-sm leading-relaxed text-zinc-400">
          Baseado no seu histórico, você lucra 18% a mais quando se posiciona em <span className="text-white font-bold">Moema</span> após as 18h. O tempo de espera médio lá é de apenas 4 minutos hoje.
        </p>
      </section>
    </div>
  );
}
