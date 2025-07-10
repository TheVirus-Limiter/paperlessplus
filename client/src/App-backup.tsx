import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import Onboarding from "@/pages/onboarding";
import Search from "@/pages/search";
import Reminders from "@/pages/reminders";
import Settings from "@/pages/settings";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { initializeSync, cleanupSync } from "@/lib/syncManager";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      initializeSync();
    } else {
      cleanupSync();
    }
    return () => cleanupSync();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Onboarding} />
          <Route path="/auth" component={AuthPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/search" component={Search} />
          <Route path="/reminders" component={Reminders} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;