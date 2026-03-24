import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Radar, 
  CheckCircle2, 
  MapPin, 
  BrainCircuit, 
  Route as RouteIcon, 
  History, 
  Settings, 
  LogOut,
  Menu,
  X,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import RegisterRide from "./pages/RegisterRide";
import Neighborhoods from "./pages/Neighborhoods";
import Intelligence from "./pages/Intelligence";
import DailyRoute from "./pages/DailyRoute";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";

// Protected Route
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isLocalMode } = useAuth();
  
  if (isLocalMode) return <>{children}</>;
  if (loading) return <div className="flex h-screen items-center justify-center bg-black text-white">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

// Login Page
const Login = () => {
  const { login, user, isLocalMode } = useAuth();
  
  if (isLocalMode || user) return <Navigate to="/" />;

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-black px-6 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20">
        <Radar className="h-10 w-10 text-white" />
      </div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">DriverDash Radar</h1>
      <p className="mb-8 text-sm text-zinc-400">Inteligência operacional para motoristas de elite.</p>
      <button
        onClick={login}
        className="flex w-full max-w-xs items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 font-semibold text-black transition-transform active:scale-95"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
        Entrar com Google
      </button>
      
      <Link to="/" className="mt-6 text-sm text-zinc-500 hover:text-zinc-300">
        Continuar sem login (Modo Local)
      </Link>
    </div>
  );
};

// Layout
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, isLocalMode, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/radar", label: "Radar", icon: Radar },
    { path: "/register", label: "Concluir", icon: CheckCircle2 },
    { path: "/neighborhoods", label: "Bairros", icon: MapPin },
    { path: "/intelligence", label: "Inteligência", icon: BrainCircuit },
    { path: "/route", label: "Rota", icon: RouteIcon },
    { path: "/history", label: "Histórico", icon: History },
    { path: "/settings", label: "Ajustes", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-20">
      {/* Local Mode Warning */}
      {isLocalMode && (
        <div className="flex items-center justify-center gap-2 bg-amber-500/10 py-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20">
          <AlertTriangle className="h-3 w-3" />
          Modo Local Ativo - Dados não sincronizados
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800 bg-black/80 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Radar className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Radar</span>
        </div>
        <button onClick={() => setIsMenuOpen(true)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around border-t border-zinc-800 bg-black/95 px-4 backdrop-blur-xl">
        {navItems.slice(0, 4).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              location.pathname === item.path ? "text-blue-500" : "text-zinc-500"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-zinc-900 p-6 shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xl font-bold">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors",
                      location.pathname === item.path ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                {!isLocalMode && user && (
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Sair
                  </button>
                )}
                {!isLocalMode && !user && (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-blue-400 hover:bg-blue-500/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Entrar
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/radar" element={<Analysis />} />
                    <Route path="/register" element={<RegisterRide />} />
                    <Route path="/neighborhoods" element={<Neighborhoods />} />
                    <Route path="/intelligence" element={<Intelligence />} />
                    <Route path="/route" element={<DailyRoute />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
