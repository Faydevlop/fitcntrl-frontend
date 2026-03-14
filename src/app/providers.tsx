"use client";

import { ReactNode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { fetchConstants, fetchProfile } from "@/store/app.slice";
import { store } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { getAccessToken } from "@/lib/api";

const AppBootstrap = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchConstants());
    if (getAccessToken()) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  return null;
};

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <AppBootstrap />
            {children}
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};
