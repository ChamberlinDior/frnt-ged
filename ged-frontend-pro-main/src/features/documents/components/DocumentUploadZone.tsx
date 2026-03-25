"use client";

import { useMemo, useRef, useState } from "react";
import { Upload, File as FileIcon, X, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DocumentUploadZone({
  selectedFile,
  onFileSelect,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png",
  maxSizeMB = 50,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxBytes = useMemo(() => maxSizeMB * 1024 * 1024, [maxSizeMB]);

  const validateAndSelect = (file: File | null) => {
    setError(null);

    if (!file) {
      onFileSelect(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > maxBytes) {
      setError(`Le fichier ne doit pas dépasser ${maxSizeMB} MB.`);
      onFileSelect(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    onFileSelect(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="text-sm">
          <div className="font-medium">Fichier</div>
          <div className="text-xs text-muted-foreground">
            PDF, Office, images (max. {maxSizeMB} MB)
          </div>
        </div>

        {selectedFile ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Changer
          </Button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => validateAndSelect(e.target.files?.[0] ?? null)}
      />

      {!selectedFile ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            validateAndSelect(e.dataTransfer.files?.[0] ?? null);
          }}
          className={cn(
            "rounded-xl border-2 border-dashed p-6 transition-all outline-none",
            "cursor-pointer select-none",
            "hover:border-primary/50 hover:bg-muted/30",
            "focus-visible:ring-3 focus-visible:ring-ring/40",
            isDragging ? "border-primary bg-muted/40" : "border-border"
          )}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div
              className={cn(
                "rounded-full p-3",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}
            >
              <Upload className={cn("h-6 w-6", isDragging ? "text-primary" : "text-muted-foreground")} />
            </div>

            <div className="text-sm font-medium">
              {isDragging ? "Déposez le fichier ici" : "Cliquez pour sélectionner un fichier"}
            </div>
            <div className="text-xs text-muted-foreground">ou glissez-déposez</div>

            <Button type="button" variant="outline" size="sm" className="mt-2 pointer-events-none">
              Choisir un fichier
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-background p-2 border">
              <FileIcon className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-medium">{selectedFile.name}</div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {formatFileSize(selectedFile.size)}
                {selectedFile.type ? ` • ${selectedFile.type}` : ""}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => validateAndSelect(null)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Retirer le fichier"
              title="Retirer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <div>{error}</div>
        </div>
      ) : null}
    </div>
  );
}
