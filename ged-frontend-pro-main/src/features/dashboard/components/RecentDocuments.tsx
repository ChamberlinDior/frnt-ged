"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDocuments } from "@/shared/api/hooks/useDocuments";
import { formatDate } from "@/shared/utils/date";
import {
  Download,
  Eye,
  File,
  FileArchive,
  FileImage,
  FileText,
  FileType,
} from "lucide-react";

const statusClasses: Record<string, string> = {
  DRAFT:
    "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
  VALIDATED:
    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
  ARCHIVED:
    "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
};

function getFileIcon(mimeType?: string | null) {
  if (!mimeType) return <File className="h-4 w-4" />;
  const value = mimeType.toLowerCase();
  if (value.includes("pdf")) return <FileText className="h-4 w-4 text-red-500" />;
  if (value.includes("image")) return <FileImage className="h-4 w-4 text-blue-500" />;
  if (value.includes("word") || value.includes("document")) {
    return <FileType className="h-4 w-4 text-blue-700" />;
  }
  if (value.includes("zip") || value.includes("archive")) {
    return <FileArchive className="h-4 w-4 text-amber-600" />;
  }
  return <File className="h-4 w-4" />;
}

export function RecentDocuments() {
  const { data: docs = [], isLoading } = useDocuments();

  const recentDocs = [...docs]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents récents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (recentDocs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-medium mb-1">Aucun document</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-[260px]">
              Commencez par créer votre premier document.
            </p>
            <Button size="sm" asChild>
              <Link href="/documents?action=new">Créer un document</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents récents</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/documents">Voir tout</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentDocs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-start justify-between border-b pb-3 last:border-0"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getFileIcon(doc.mimeType)}
                <span className="font-medium">{doc.title}</span>
                <Badge
                  variant="outline"
                  className={statusClasses[doc.status] ?? ""}
                >
                  {doc.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Réf. {doc.referenceCode}</span>
                <span>•</span>
                <span>{formatDate(doc.documentDate)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a
                      href={doc.openUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!doc.openUrl}
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ouvrir le document</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a
                      href={doc.downloadUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!doc.downloadUrl}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Télécharger</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
