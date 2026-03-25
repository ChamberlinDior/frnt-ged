"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, Eye, EyeOff } from "lucide-react";

type Props = {
  total: number;
  activeCount: number;
  inactiveCount: number;
  onNew: () => void;
};

export function CategoriesHeader({ total, activeCount, inactiveCount, onNew }: Props) {
  const cards = [
    {
      label: "Total",
      value: total,
      icon: FolderOpen,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Actives",
      value: activeCount,
      icon: Eye,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Inactives",
      value: inactiveCount,
      icon: EyeOff,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Gérez les catégories documentaires pour organiser et classifier vos documents.
          </p>
        </div>
        <Button onClick={onNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
