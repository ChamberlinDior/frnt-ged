"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/shared/api/hooks/useCategories";
import { useDepartments } from "@/shared/api/hooks/useDepartments";
import { useDocuments } from "@/shared/api/hooks/useDocuments";
import { Building2, CheckCircle, FileText, Tag } from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

export function StatCards() {
  const documents = useDocuments();
  const categories = useCategories();
  const departments = useDepartments();

  const docs = documents.data ?? [];
  const cats = categories.data ?? [];
  const depts = departments.data ?? [];

  const activeDocs = docs.filter((d) => d.active).length;

  const loading =
    documents.isLoading || categories.isLoading || departments.isLoading;

  const error =
    (documents.error as Error | null)?.message ||
    (categories.error as Error | null)?.message ||
    (departments.error as Error | null)?.message ||
    "";

  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-sm">Erreur de chargement</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Documents" value={docs.length} icon={FileText} loading={loading} />
      <StatCard title="Actifs" value={activeDocs} icon={CheckCircle} loading={loading} />
      <StatCard title="Catégories" value={cats.length} icon={Tag} loading={loading} />
      <StatCard title="Départements" value={depts.length} icon={Building2} loading={loading} />
    </div>
  );
}
