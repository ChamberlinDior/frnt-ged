"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/shared/utils/date";
import type { DocumentItem } from "@/shared/api/resources/document";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Maximize2, Printer } from "lucide-react";

type Props = {
  document: DocumentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DocumentPreviewDialog({ document, open, onOpenChange }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const previewUrl = document?.openUrl ?? document?.downloadUrl ?? null;

  const handlePrint = () => {
    if (!previewUrl) return;

    const w = window.open(previewUrl, "_blank", "noopener,noreferrer");
    if (!w) return;

    const doPrint = () => {
      w.focus();
      w.print();
    };

    w.onload = () => setTimeout(doPrint, 250);
    setTimeout(doPrint, 1200);
  };

  const kind = useMemo(() => {
    const mime = document?.mimeType?.toLowerCase() ?? "";
    if (mime.includes("pdf")) return "pdf";
    if (mime.includes("image")) return "image";
    return "other";
  }, [document?.mimeType]);

  if (!document) return null;

  const descriptionId = "document-preview-dialog-description";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0",
          isFullscreen ? "max-w-[95vw] h-[95vh]" : "max-w-4xl h-[80vh]"
        )}
        showCloseButton={false}
        aria-describedby={descriptionId}
      >
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-medium truncate max-w-[600px]">
            {document.title}
          </DialogTitle>
          <DialogDescription id={descriptionId} className="sr-only">
            Aperçu et actions rapides pour le document sélectionné.
          </DialogDescription>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              disabled={!previewUrl}
              title={previewUrl ? "Imprimer" : "Impression indisponible"}
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen((v) => !v)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href={document.downloadUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              ✕
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 bg-muted/10">
          {previewUrl ? (
            kind === "pdf" ? (
              <iframe
                src={`${previewUrl}#view=FitH`}
                className="w-full h-full rounded-lg border"
                title={document.title}
              />
            ) : kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={document.title}
                className="max-w-full max-h-full object-contain mx-auto"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-sm text-muted-foreground mb-4">
                  Aperçu non disponible pour ce type de fichier.
                </p>
                <Button asChild>
                  <a
                    href={document.downloadUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </a>
                </Button>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Aucun aperçu disponible
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Référence:</span>{" "}
              <span className="font-medium">{document.referenceCode}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Statut:</span>{" "}
              <span className="font-medium">{document.status}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Catégorie:</span>{" "}
              <span className="font-medium">{document.categoryName ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Département:</span>{" "}
              <span className="font-medium">{document.departmentName ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>{" "}
              <span className="font-medium">{formatDate(document.documentDate)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
