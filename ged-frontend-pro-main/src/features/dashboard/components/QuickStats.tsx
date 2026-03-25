"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDocuments } from "@/shared/api/hooks/useDocuments";
import { formatRelativeDate } from "@/shared/utils/date";
import { Archive, CheckCircle, Clock, FileText } from "lucide-react";

type QuickStatItem = {
  label: string;
  value: string | number;
  subValue?: string | null;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
};

export function QuickStats() {
  const { data: docs = [] } = useDocuments();

  const totalDocs = docs.length;
  const validatedDocs = docs.filter((d) => d.status === "VALIDATED").length;
  const archivedDocs = docs.filter((d) => d.status === "ARCHIVED").length;

  const lastDocument =
    docs.length > 0
      ? [...docs].sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        })[0]
      : null;

  const stats = [
    {
      label: "Total documents",
      value: totalDocs,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Documents validés",
      value: validatedDocs,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      label: "Documents archivés",
      value: archivedDocs,
      icon: Archive,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      label: "Dernier document",
      value: lastDocument?.title?.slice(0, 20) || "Aucun",
      subValue: lastDocument?.createdAt ? formatRelativeDate(lastDocument.createdAt) : null,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ] satisfies QuickStatItem[];

  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <div
                    className="text-2xl font-bold truncate"
                    title={typeof stat.value === "string" ? stat.value : String(stat.value)}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  {stat.subValue && (
                    <div className="text-xs text-muted-foreground mt-1">{stat.subValue}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
