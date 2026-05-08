import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Subscription {
  plan: "trial" | "pro";
  trial_expires_at: string | null;
  pro_expires_at: string | null;
}

export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery<Subscription | null>({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("subscriptions")
        .select("plan, trial_expires_at, pro_expires_at")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) return null;
      return data ?? null;
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return { isLoading: true, isBlocked: false, isTrial: false, daysLeft: 0 };
  }

  // Usuário ainda não tem linha na tabela → trata como trial novo
  if (!subscription) {
    return { isLoading: false, isBlocked: false, isTrial: true, daysLeft: 7 };
  }

  const now = new Date();
  const { plan, trial_expires_at, pro_expires_at } = subscription;

  // ── PRO ──────────────────────────────────────────────────
  if (plan === "pro") {
    if (!pro_expires_at) {
      return { isLoading: false, isBlocked: false, isTrial: false, daysLeft: 0 };
    }
    if (now < new Date(pro_expires_at)) {
      return { isLoading: false, isBlocked: false, isTrial: false, daysLeft: 0 };
    }
    // PRO expirado → bloqueia
    return { isLoading: false, isBlocked: true, isTrial: false, daysLeft: 0 };
  }

  // ── TRIAL ─────────────────────────────────────────────────
  if (plan === "trial") {
    if (!trial_expires_at) {
      return { isLoading: false, isBlocked: true, isTrial: false, daysLeft: 0 };
    }
    const trialEnd = new Date(trial_expires_at);
    if (now < trialEnd) {
      const daysLeft = Math.ceil(
        (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return { isLoading: false, isBlocked: false, isTrial: true, daysLeft };
    }
    // Trial expirado → bloqueia
    return { isLoading: false, isBlocked: true, isTrial: false, daysLeft: 0 };
  }

  // Qualquer plano desconhecido → bloqueia por segurança
  return { isLoading: false, isBlocked: true, isTrial: false, daysLeft: 0 };
}