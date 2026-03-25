"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Filter, RefreshCw, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { DepartmentActiveFilter } from "@/features/departments/types";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onSearchApply: () => void;
  activeFilter: DepartmentActiveFilter;
  onActiveFilterChange: (v: DepartmentActiveFilter) => void;
  onReset: () => void;
  total: number;
};

export function DepartmentsToolbar({
  search,
  onSearchChange,
  onSearchApply,
  activeFilter,
  onActiveFilterChange,
  onReset,
  total,
}: Props) {
  const queryClient = useQueryClient();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFiltersCount = useMemo(() => {
    return [search.trim() ? true : null, activeFilter !== "all" ? true : null].filter(Boolean).length;
  }, [search, activeFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Départements rechargés");
    } catch (e) {
      toast.error("Erreur", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom…"
              className="pl-10 h-10 bg-background"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearchApply();
              }}
            />
          </div>

          <Button className="h-10" onClick={onSearchApply}>
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>

          <Button
            variant={showAdvanced ? "default" : "outline"}
            className="h-10 relative"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {activeFiltersCount > 0 ? (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                {activeFiltersCount}
              </span>
            ) : null}
          </Button>

          <div className="hidden md:block h-6 w-px bg-border" />

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Recharger"
          >
            <RefreshCw className={"h-4 w-4" + (isRefreshing ? " animate-spin" : "")} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={onReset}
            title="Réinitialiser"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <div className="text-sm text-muted-foreground ml-auto">
            {`${total} département${total > 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {showAdvanced ? (
        <div className="p-4 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={activeFilter} onValueChange={(v) => onActiveFilterChange(v as DepartmentActiveFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="active">Actives</SelectItem>
                  <SelectItem value="inactive">Inactives</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFiltersCount > 0 ? (
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={onReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
