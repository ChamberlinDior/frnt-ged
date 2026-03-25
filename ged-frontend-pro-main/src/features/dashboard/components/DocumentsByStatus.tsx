"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocuments } from "@/shared/api/hooks/useDocuments";

export function DocumentsByStatus() {
  const { data: docs = [], isLoading } = useDocuments();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents par statut</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const total = docs.length;
  const draftCount = docs.filter((d) => d.status === "DRAFT").length;
  const validatedCount = docs.filter((d) => d.status === "VALIDATED").length;
  const archivedCount = docs.filter((d) => d.status === "ARCHIVED").length;

  const getPercentage = (count: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents par statut</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Brouillons</span>
            <span className="font-medium">{draftCount}</span>
          </div>
          <Progress value={getPercentage(draftCount)} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Validés</span>
            <span className="font-medium">{validatedCount}</span>
          </div>
          <Progress value={getPercentage(validatedCount)} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Archivés</span>
            <span className="font-medium">{archivedCount}</span>
          </div>
          <Progress value={getPercentage(archivedCount)} />
        </div>

        {total === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun document à afficher
          </p>
        )}
      </CardContent>
    </Card>
  );
}
