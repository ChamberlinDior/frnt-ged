"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FilePlus, FolderPlus, Upload } from "lucide-react";

export function QuickActions() {
  const handleUpload = () => {
    toast.info("Fonctionnalité à venir", {
      description: "L'upload rapide sera disponible dans la page Documents",
    });
  };

  const actions = [
    {
      label: "Nouveau document",
      icon: FilePlus,
      href: "/documents?action=new",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Upload rapide",
      icon: Upload,
      onClick: handleUpload,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Nouvelle catégorie",
      icon: FolderPlus,
      href: "/categories?action=new",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      label: "Nouveau département",
      icon: Building2,
      href: "/departments?action=new",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;

            const content = (
              <>
                <div className={`p-2 rounded-full ${action.bgColor} mb-1`}>
                  <Icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </>
            );

            if ("href" in action && action.href) {
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                  asChild
                >
                  <Link href={action.href}>{content}</Link>
                </Button>
              );
            }

            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                onClick={action.onClick}
              >
                {content}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
