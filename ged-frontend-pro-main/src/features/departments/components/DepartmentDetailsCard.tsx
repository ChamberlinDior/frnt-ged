"use client";

import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/shared/utils/date";
import type { Department } from "@/shared/api/resources/department";

type Props = {
  item: Department | null;
};

export function DepartmentDetailsCard({ item }: Props) {
  const router = useRouter();

  return (
    <Card className="shadow-sm bg-white/80 backdrop-blur border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Fiche département</CardTitle>
      </CardHeader>
      <CardContent>
        {item ? (
          <div className="grid gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Identifiant</div>
              <div className="font-semibold">#{item.id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Nom</div>
              <div className="font-medium">{item.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Description</div>
              <div className="text-muted-foreground leading-relaxed">
                {item.description?.trim() ? item.description : "Aucune description renseignée."}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Statut</div>
              <div className="mt-1">
                <Badge variant="outline">{item.active ? "Active" : "Inactive"}</Badge>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Date de création</div>
              <div className="font-medium">{item.createdAt ? formatDate(item.createdAt) : "—"}</div>
            </div>

            <div className="pt-2">
              <div className="text-xs text-muted-foreground">Documents</div>
              <div className="mt-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => router.push(`/documents?departmentId=${item.id}`)}
                >
                  Voir les documents de ce département
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground leading-relaxed">
            Sélectionnez un département dans la liste pour afficher sa fiche détaillée.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
