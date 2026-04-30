import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Subscription {
  status: string;
  trial_ends_at: string;
  current_period_end: string | null;
}

export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery<Subscription | null>({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("subscriptions")
        .select("status, trial_ends_at, current_period_end")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) return null;
      return data ?? null;
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  const now = new Date();

  if (isLoading) {
    return { isLoading: true, isBlocked: false, isTrial: false, daysLeft: 0 };
  }

  if (!subscription) {
    return { isLoading: false, isBlocked: false, isTrial: true, daysLeft: 7 };
  }

  const { status, trial_ends_at, current_period_end } = subscription;

  // ✅ Assinatura ativa — current_period_end obrigatório
  if (status === "active") {
    if (!current_period_end) {
      // 🔒 Corrigido: sem data de vencimento = bloqueado
      return { isLoading: false, isBlocked: true, isTrial: false, daysLeft: 0 };
    }
    const periodEnd = new Date(current_period_end);
    if (now < periodEnd) {
      return { isLoading: false, isBlocked: false, isTrial: false, daysLeft: 0 };
    }
  }

  // ✅ Trial ainda válido
  if (status === "trialing") {
    const trialEnd = new Date(trial_ends_at);
    if (now < trialEnd) {
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { isLoading: false, isBlocked: false, isTrial: true, daysLeft };
    }
  }

  // 🔒 Qualquer outro caso = bloqueado
  return { isLoading: false, isBlocked: true, isTrial: false, daysLeft: 0 };
}