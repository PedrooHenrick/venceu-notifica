import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, Users, FileText, BarChart3, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/empresas", label: "Empresas", icon: Building2 },
  { to: "/funcionarios", label: "Funcionários", icon: Users },
  { to: "/documentos-empresa", label: "Doc. Empresa", icon: FileText },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-[15px] font-semibold tracking-tight">UniDatas</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-primary-foreground/80 sm:inline">{user?.email}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={async () => { await signOut(); navigate("/auth"); }}
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:block">
          <nav className="py-2">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 border-l-[3px] px-4 py-2.5 text-[13px] font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-transparent text-foreground/70 hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="relative min-w-0 flex-1">
          <div className="px-4 py-5 pb-24 md:px-6 md:py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border bg-card md:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}