"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";
import type { DocumentFilters } from "@/features/documents/types";

type SimpleItem = { id: number; name: string };

type Props = {
  filters: DocumentFilters;
  onFilterChange: <K extends keyof DocumentFilters>(key: K, value: DocumentFilters[K]) => void;
  categories: SimpleItem[];
  departments: SimpleItem[];
};

export function DocumentsSearch({ filters, onFilterChange, categories, departments }: Props) {
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
    onFilterChange("search", localSearch.trim() || undefined);
  };

  const clearFilters = () => {
    setLocalSearch("");
    onFilterChange("search", undefined);
    onFilterChange("status", "all");
    onFilterChange("categoryId", undefined);
    onFilterChange("departmentId", undefined);
    onFilterChange("active", undefined);
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou référence…"
              className="pl-10 h-10"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
            />
          </div>

          <Button className="h-10" onClick={applySearch}>
            Rechercher
          </Button>

          <Button
            variant="outline"
            className="h-10 relative"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {activeFiltersCount > 0 ? (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-600">
                {activeFiltersCount}
              </Badge>
            ) : null}
          </Button>
        </div>

        {showAdvanced ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
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
                  onFilterChange("categoryId", v === "all" ? undefined : Number(v))
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
                  onFilterChange("departmentId", v === "all" ? undefined : Number(v))
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

            <div className="col-span-full flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <input
                  id="active-only"
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={filters.active === true}
                  onChange={(e) => onFilterChange("active", e.target.checked ? true : undefined)}
                />
                <label htmlFor="active-only" className="text-sm">
                  Actifs uniquement
                </label>
              </div>

              {activeFiltersCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
