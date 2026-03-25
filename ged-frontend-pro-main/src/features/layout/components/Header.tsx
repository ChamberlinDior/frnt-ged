"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Calendar, Globe, RefreshCw } from "lucide-react";

type Props = {
  onRefresh?: () => void;
};

export function Header({ onRefresh }: Props) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString(language === "fr" ? "fr-FR" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setCurrentDate(formatted);
    };

    updateDate();
    const interval = setInterval(updateDate, 60_000);
    return () => clearInterval(interval);
  }, [language]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["documents"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({ queryKey: ["departments"] }),
      ]);
      toast.success("Données mises à jour", {
        description: "Les dernières informations ont été chargées.",
      });
      onRefresh?.();
    } catch {
      toast.error("Erreur", {
        description: "Impossible de rafraîchir les données.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLanguageChange = (lang: "fr" | "en") => {
    setLanguage(lang);
    toast.info(`Langue: ${lang === "fr" ? "Français" : "English"}`, {
      description: "Cette fonctionnalité sera bientôt disponible.",
    });
  };

  return (
    <header className="shrink-0 text-white shadow-lg bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
              <span className="text-xl font-bold">📄</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl font-bold tracking-tight leading-none truncate">GED Pro</div>
              <div className="text-xs text-blue-100 mt-1 truncate">Console documentaire</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="uppercase text-sm font-medium">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange("fr")} className="gap-2">
                  <span className="text-base">🇫🇷</span>
                  Français
                  {language === "fr" ? <span className="ml-auto text-emerald-600">✓</span> : null}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("en")} className="gap-2">
                  <span className="text-base">🇬🇧</span>
                  English
                  {language === "en" ? <span className="ml-auto text-emerald-600">✓</span> : null}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
              <Calendar className="h-4 w-4 text-blue-100" />
              <span className="text-sm font-medium">{currentDate}</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-white hover:bg-white/10"
              title="Rafraîchir les données"
              aria-label="Rafraîchir les données"
            >
              <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
