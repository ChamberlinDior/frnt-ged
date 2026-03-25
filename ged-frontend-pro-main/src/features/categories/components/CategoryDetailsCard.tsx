"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/shared/utils/date";
import type { Category } from "@/shared/api/resources/category";

type Props = {
  item: Category | null;
};

export function CategoryDetailsCard({ item }: Props) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Fiche catégorie</CardTitle>
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
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground leading-relaxed">
            Sélectionnez une catégorie dans la liste pour afficher sa fiche détaillée.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
