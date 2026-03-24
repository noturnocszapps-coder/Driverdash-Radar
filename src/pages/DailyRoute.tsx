import React from "react";
import { 
  Route as RouteIcon, 
  Sun, 
  CloudSun, 
  Moon, 
  MapPin, 
  AlertCircle,
  ChevronRight,
  Zap
} from "lucide-react";

const PeriodCard = ({ period, title, neighborhoods, app, icon: Icon, color }: any) => (
  <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-6 border border-zinc-800">
    <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-${color}-500/10 blur-2xl`} />
    
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${color}-500/10 text-${color}-500`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{period}</p>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">App Dominante</p>
        <p className="text-sm font-bold text-white">{app}</p>
      </div>
    </div>

    <div className="space-y-3">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Melhores Bairros</p>
      <div className="flex flex-wrap gap-2">
        {neighborhoods.map((n: string) => (
          <span key={n} className="rounded-full bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 border border-zinc-700">
            {n}
          </span>
        ))}
      </div>
    </div>

    <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
        <Zap className="h-4 w-4 text-yellow-500" />
        Potencial de Ganho: <span className="text-white font-bold">Alto</span>
      </div>
      <ChevronRight className="h-5 w-5 text-zinc-600" />
    </div>
  </div>
);

export default function DailyRoute() {
  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h2 className="text-sm font-medium text-blue-500 uppercase tracking-widest">Planejamento</h2>
        <h1 className="text-3xl font-bold tracking-tight">Rota do Dia</h1>
      </section>

      <div className="space-y-6">
        <PeriodCard 
          period="Manhã"
          title="Fluxo Residencial"
          neighborhoods={["Morumbi", "Panamby", "Jardins"]}
          app="Uber"
          icon={Sun}
          color="orange"
        />
        <PeriodCard 
          period="Tarde"
          title="Fluxo Comercial"
          neighborhoods={["Faria Lima", "Berrini", "Paulista"]}
          app="99"
          icon={CloudSun}
          color="blue"
        />
        <PeriodCard 
          period="Noite"
          title="Lazer e Gastronomia"
          neighborhoods={["Vila Madalena", "Pinheiros", "Moema"]}
          app="Uber"
          icon={Moon}
          color="indigo"
        />
      </div>

      <section className="rounded-2xl bg-rose-500/10 p-5 border border-rose-500/20">
        <div className="mb-2 flex items-center gap-2 text-rose-500">
          <AlertCircle className="h-5 w-5" />
          <h4 className="font-bold">Bairros a Evitar</h4>
        </div>
        <p className="text-xs text-rose-200/70 leading-relaxed">
          Evite a região da <span className="font-bold text-rose-400">Marginal Tietê</span> sentido Lapa devido a acidente grave. O tempo de espera para corridas saindo de lá está acima de 15 minutos.
        </p>
      </section>
    </div>
  );
}
