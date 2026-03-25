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

import type { DocumentFilters } from "@/features/documents/types";

type SimpleItem = { id: number; name: string };

type Props = {
  filters: DocumentFilters;
  onFilterChange: <K extends keyof DocumentFilters>(key: K, value: DocumentFilters[K]) => void;
  categories: SimpleItem[];
  departments: SimpleItem[];
  totalDocuments: number;
  onResetFilters: () => void;
};

export function DocumentsToolbar({
  filters,
  onFilterChange,
  categories,
  departments,
  totalDocuments,
  onResetFilters,
}: Props) {
  const queryClient = useQueryClient();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search ?? "");

  const activeFiltersCount = useMemo(() => {
    return [
      (filters.search ?? "").trim() ? true : null,
      filters.status && filters.status !== "all" ? true : null,
      filters.categoryId ? true : null,
      filters.departmentId ? true : null,
      typeof filters.active === "boolean" ? true : null,
    ].filter(Boolean).length;
  }, [filters]);

  const applySearch = () => {
    onFilterChange("search", (localSearch.trim() || undefined) as DocumentFilters["search"]);
  };

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
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou référence…"
              className="pl-10 h-10 bg-background"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
            />
          </div>

          <Button className="h-10" onClick={applySearch}>
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
            onClick={onResetFilters}
            title="Réinitialiser"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <div className="text-sm text-muted-foreground ml-auto">
            {`${totalDocuments} document${totalDocuments > 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {showAdvanced ? (
        <div className="p-4 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select
                value={filters.status ?? "all"}
                onValueChange={(v) => onFilterChange("status", v as DocumentFilters["status"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="VALIDATED">Validé</SelectItem>
                  <SelectItem value="ARCHIVED">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select
                value={filters.categoryId ? String(filters.categoryId) : "all"}
                onValueChange={(v) =>
                  onFilterChange("categoryId", (v === "all" ? undefined : Number(v)) as DocumentFilters["categoryId"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Département</label>
              <Select
                value={filters.departmentId ? String(filters.departmentId) : "all"}
                onValueChange={(v) =>
                  onFilterChange(
                    "departmentId",
                    (v === "all" ? undefined : Number(v)) as DocumentFilters["departmentId"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les départements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              id="active-only-toolbar"
              type="checkbox"
              className="h-4 w-4 rounded border-input"
              checked={filters.active === true}
              onChange={(e) => onFilterChange("active", (e.target.checked ? true : undefined) as DocumentFilters["active"])}
            />
            <label htmlFor="active-only-toolbar" className="text-sm">
              Actifs uniquement
            </label>

            {activeFiltersCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground"
                onClick={onResetFilters}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
