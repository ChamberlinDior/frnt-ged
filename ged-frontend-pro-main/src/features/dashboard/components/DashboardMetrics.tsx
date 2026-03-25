"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/shared/api/hooks/useCategories";
import { useDepartments } from "@/shared/api/hooks/useDepartments";
import { useDocuments } from "@/shared/api/hooks/useDocuments";
import { CheckCircle, Clock, FileText, TrendingUp } from "lucide-react";

type MetricItem = {
  label: string;
  value: string | number;
  subValue: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
};

export function DashboardMetrics() {
  const { data: docs = [], isLoading: docsLoading } = useDocuments();
  const { data: cats = [], isLoading: catsLoading } = useCategories();
  const { data: depts = [], isLoading: deptsLoading } = useDepartments();

  const isLoading = docsLoading || catsLoading || deptsLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24 mt-3" />
              <Skeleton className="h-3 w-40 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const pendingApprovals = docs.filter((d) => d.status === "DRAFT").length;
  const validatedCount = docs.filter((d) => d.status === "VALIDATED").length;
  const complianceRate = docs.length > 0 ? Math.round((validatedCount / docs.length) * 100) : 0;

  const metrics: MetricItem[] = [
    {
      label: "Total documents",
      value: docs.length,
      subValue: `${cats.length} catégories`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "En attente",
      value: pendingApprovals,
      subValue: "À valider",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      label: "Validés",
      value: validatedCount,
      subValue: `${docs.filter((d) => d.status === "ARCHIVED").length} archivés`,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      label: "Taux de conformité",
      value: `${complianceRate}%`,
      subValue: `${depts.length} départements`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold mt-2 truncate" title={String(metric.value)}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.subValue}</p>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
