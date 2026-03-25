"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Clock, CheckCircle, Archive } from "lucide-react";
import type { DocumentItem } from "@/shared/api/resources/document";

type Props = {
  documents: DocumentItem[];
  total: number;
  onNewDocument: () => void;
};

export function DocumentsHeader({ documents, total, onNewDocument }: Props) {
  const draft = documents.filter((d) => d.status === "DRAFT").length;
  const validated = documents.filter((d) => d.status === "VALIDATED").length;
  const archived = documents.filter((d) => d.status === "ARCHIVED").length;

  const cards = [
    {
      label: "Total",
      value: total,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Brouillons",
      value: draft,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Validés",
      value: validated,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Archivés",
      value: archived,
      icon: Archive,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Gérez vos documents, suivez les statuts et accédez rapidement aux actions clés.
          </p>
        </div>
        <Button onClick={onNewDocument} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="shadow-sm border-muted">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{c.label}</div>
                  <div className="text-2xl font-bold mt-2">{c.value}</div>
                </div>
                <div className={`p-3 rounded-full ${c.bg}`}>
                  <Icon className={`h-5 w-5 ${c.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
