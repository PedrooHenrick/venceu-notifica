import { Navigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isBlocked } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isBlocked) {
    return <Navigate to="/planos" replace />;
  }

  return <>{children}</>;
}