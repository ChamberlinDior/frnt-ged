"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, RotateCcw, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  showActiveOnly: boolean;
  onToggleActiveOnly: () => void;
  onResetFilters: () => void;
};

export function DocumentActionBar({ showActiveOnly, onToggleActiveOnly, onResetFilters }: Props) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Documents rechargés");
    } catch (e) {
      toast.error("Erreur", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={"h-4 w-4 mr-2" + (isRefreshing ? " animate-spin" : "")} />
        {isRefreshing ? "Rechargement…" : "Recharger tous"}
      </Button>

      <Button
        type="button"
        variant={showActiveOnly ? "default" : "outline"}
        size="sm"
        onClick={onToggleActiveOnly}
      >
        <Eye className="h-4 w-4 mr-2" />
        Actifs uniquement
      </Button>

      <Button type="button" variant="outline" size="sm" onClick={onResetFilters}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Réinitialiser filtres
      </Button>
    </div>
  );
}
