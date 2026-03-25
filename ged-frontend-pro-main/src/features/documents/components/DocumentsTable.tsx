"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDate } from "@/shared/utils/date";
import type { DocumentItem } from "@/shared/api/resources/document";
import type { DocumentFilters } from "@/features/documents/types";
import { statusBadgeClasses, statusLabels } from "@/features/documents/types";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

type Props = {
  documents: DocumentItem[];
  total: number;
  isLoading?: boolean;
  filters: DocumentFilters;
  onFilterChange: <K extends keyof DocumentFilters>(key: K, value: DocumentFilters[K]) => void;
  onView: (doc: DocumentItem) => void;
  onDownload: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
};

export function DocumentsTable({
  documents,
  total,
  isLoading,
  filters,
  onFilterChange,
  onView,
  onDownload,
  onEdit,
  onDelete,
}: Props) {
  const limit = filters.limit ?? 10;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSort = (sortBy: NonNullable<DocumentFilters["sortBy"]>) => {
    const current = filters.sortBy ?? "date";
    const currentOrder = filters.sortOrder ?? "desc";
    const nextOrder = current === sortBy && currentOrder === "desc" ? "asc" : "desc";
    onFilterChange("sortBy", sortBy);
    onFilterChange("sortOrder", nextOrder);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[320px]">
                <Button
                  variant="ghost"
                  className="px-0 hover:bg-transparent"
                  onClick={() => handleSort("title")}
                >
                  Titre
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="px-0 hover:bg-transparent"
                  onClick={() => handleSort("status")}
                >
                  Statut
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="px-0 hover:bg-transparent"
                  onClick={() => handleSort("date")}
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="text-sm text-muted-foreground">
                    Aucun document trouvé.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id} className="group hover:bg-muted/50">
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell className="text-muted-foreground">{doc.referenceCode}</TableCell>
                  <TableCell>{doc.categoryName ?? "—"}</TableCell>
                  <TableCell>{doc.departmentName ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("font-medium", statusBadgeClasses[doc.status])}
                    >
                      {statusLabels[doc.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(doc.documentDate)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(doc)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDownload(doc)}>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(doc)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(doc)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Affichage {(page - 1) * limit + 1}-{Math.min(page * limit, total)} sur {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => onFilterChange("page", page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-3">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => onFilterChange("page", page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
