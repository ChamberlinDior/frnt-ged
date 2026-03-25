"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocuments } from "@/shared/api/hooks/useDocuments";
import { AlertCircle } from "lucide-react";

type Metric = {
  label: string;
  value: number;
  count: number;
  description: string;
  indicatorClassName: string;
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function ComplianceProgress() {
  const { data: docs = [], isLoading } = useDocuments();

  if (isLoading) {
    return (
      <Card className="shadow-sm border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Progression conformité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const total = docs.length;

  const validated = docs.filter((d) => d.status === "VALIDATED").length;
  const archived = docs.filter((d) => d.status === "ARCHIVED").length;
  const active = docs.filter((d) => d.active).length;
  const completeMeta = docs.filter((d) => !!d.description && !!d.referenceCode).length;

  const metrics: Metric[] = [
    {
      label: "Validation",
      count: validated,
      value: total > 0 ? (validated / total) * 100 : 0,
      description: "Documents validés",
      indicatorClassName: "bg-emerald-600",
    },
    {
      label: "Actifs",
      count: active,
      value: total > 0 ? (active / total) * 100 : 0,
      description: "Documents actifs",
      indicatorClassName: "bg-blue-600",
    },
    {
      label: "Archivage",
      count: archived,
      value: total > 0 ? (archived / total) * 100 : 0,
      description: "Documents archivés",
      indicatorClassName: "bg-purple-600",
    },
    {
      label: "Métadonnées",
      count: completeMeta,
      value: total > 0 ? (completeMeta / total) * 100 : 0,
      description: "Documents avec métadonnées complètes",
      indicatorClassName: "bg-amber-600",
    },
  ];

  if (total === 0) {
    return (
      <Card className="shadow-sm border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Progression conformité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-3 rounded-full bg-amber-100 mb-4">
              <AlertCircle className="h-6 w-6 text-amber-700" />
            </div>
            <p className="text-sm font-medium mb-2">Aucune donnée disponible</p>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              Ajoutez des documents pour visualiser les indicateurs de conformité.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Progression conformité</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => {
          const value = clampPercent(metric.value);
          return (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{metric.label}</span>
                  <span className="text-xs text-muted-foreground">({metric.count}/{total})</span>
                </div>
                <span className="text-sm font-semibold">{value}%</span>
              </div>
              <Progress value={value} indicatorClassName={metric.indicatorClassName} />
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Taux global</span>
            <span className="font-semibold text-blue-600">
              {Math.round(metrics.reduce((acc, m) => acc + clampPercent(m.value), 0) / metrics.length)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
