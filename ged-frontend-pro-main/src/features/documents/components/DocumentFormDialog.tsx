"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Category } from "@/shared/api/resources/category";
import type { Department } from "@/shared/api/resources/department";
import type { DocumentItem, DocumentRequest, DocumentUploadRequest } from "@/shared/api/resources/document";
import { documentFormSchema } from "@/features/documents/types";
import { DocumentUploadZone } from "@/features/documents/components/DocumentUploadZone";
import { Download, ExternalLink, Printer } from "lucide-react";

type Mode = "upload" | "link" | "manual";

function getDefaultMode(document?: DocumentItem): Mode {
  if (!document) return "upload";
  if (document.externalDocument) return "link";
  if (document.filePath) return "manual";
  return "upload";
}

function generateReferenceCode() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `DOC-${yy}${mm}${dd}-${rand}`;
}

const DOCUMENT_PRESETS = [
  {
    title: "Courrier entrant",
    status: "DRAFT" as const,
    description: "Document entrant à enregistrer et à classer.",
  },
  {
    title: "Note de service",
    status: "VALIDATED" as const,
    description: "Communication ou instruction interne validée.",
  },
  {
    title: "Rapport d'activité",
    status: "VALIDATED" as const,
    description: "Rapport structuré pour consultation et archivage.",
  },
  {
    title: "Décision administrative",
    status: "ARCHIVED" as const,
    description: "Acte final validé destiné à l'archivage.",
  },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: DocumentItem;
  categories: Category[];
  departments: Department[];
  onCreate: (payload: DocumentRequest | DocumentUploadRequest, mode: Mode) => Promise<void>;
  onUpdate: (id: number, payload: DocumentRequest | DocumentUploadRequest, mode: Mode) => Promise<void>;
  isLoading?: boolean;
};

export function DocumentFormDialog({
  open,
  onOpenChange,
  document,
  categories,
  departments,
  onCreate,
  onUpdate,
  isLoading,
}: Props) {
  const isEdit = !!document;
  const [mode, setMode] = useState<Mode>(() => getDefaultMode(document));
  const [file, setFile] = useState<File | null>(null);

  const defaultCategoryId = useMemo(() => categories[0]?.id ?? 0, [categories]);
  const defaultDepartmentId = useMemo(() => departments[0]?.id ?? 0, [departments]);

  type FormValues = z.infer<typeof documentFormSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      referenceCode: "",
      description: "",
      status: "DRAFT",
      documentDate: new Date().toISOString().slice(0, 10),
      active: true,
      categoryId: defaultCategoryId,
      departmentId: defaultDepartmentId,
      externalUrl: "",
      filePath: "",
    },
  });

  const activeValue = useWatch({ control: form.control, name: "active" });

  const localPreviewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    if (!open) return;

    if (document) {
      form.reset({
        title: document.title,
        referenceCode: document.referenceCode,
        description: document.description ?? "",
        status: document.status,
        documentDate: document.documentDate,
        active: document.active,
        categoryId: document.categoryId ?? defaultCategoryId,
        departmentId: document.departmentId ?? defaultDepartmentId,
        externalUrl: document.externalUrl ?? "",
        filePath: document.filePath ?? "",
      });
      return;
    }

    form.reset({
      title: "",
      referenceCode: "",
      description: "",
      status: "DRAFT",
      documentDate: new Date().toISOString().slice(0, 10),
      active: true,
      categoryId: defaultCategoryId,
      departmentId: defaultDepartmentId,
      externalUrl: "",
      filePath: "",
    });

    const currentRef = form.getValues("referenceCode");
    if (!currentRef) {
      form.setValue("referenceCode", generateReferenceCode(), { shouldDirty: true });
    }
  }, [open, document, form, defaultCategoryId, defaultDepartmentId]);

  const handleSubmit = async (values: FormValues) => {
    const description = values.description?.trim() || null;
    const externalUrl = values.externalUrl?.trim() || null;
    const filePath = values.filePath?.trim() || null;

    const base: DocumentRequest = {
      title: values.title,
      referenceCode: values.referenceCode ?? "",
      description,
      status: values.status,
      documentDate: values.documentDate,
      active: values.active,
      categoryId: values.categoryId,
      departmentId: values.departmentId,
      externalDocument: mode === "link",
      externalUrl: mode === "link" ? externalUrl : null,
      filePath: mode === "manual" ? filePath : null,
    };

    if (mode === "upload") {
      if (!file) {
        if (document) {
          await onUpdate(document.id, base, "manual");
          return;
        }

        form.setError("filePath", { type: "manual", message: "Veuillez sélectionner un fichier." });
        return;
      }

      const payload: DocumentUploadRequest = {
        title: base.title,
        referenceCode: base.referenceCode,
        description: base.description,
        status: base.status,
        documentDate: base.documentDate,
        active: base.active,
        categoryId: base.categoryId,
        departmentId: base.departmentId,
        file,
      };

      if (document) {
        await onUpdate(document.id, payload, "upload");
      } else {
        await onCreate(payload, "upload");
      }

      return;
    }

    if (document) {
      await onUpdate(document.id, base, mode);
    } else {
      await onCreate(base, mode);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>{isEdit ? "Modifier le document" : "Créer un document"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations du document."
              : "Renseignez les informations pour créer un nouveau document."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="text-sm font-medium">Modèles de documents</div>
          <div className="flex flex-wrap gap-2">
            {DOCUMENT_PRESETS.map((preset) => (
              <Button
                key={preset.title}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue("title", preset.title);
                  form.setValue("status", preset.status);
                  form.setValue("description", preset.description);
                }}
              >
                {preset.title}
              </Button>
            ))}
          </div>
        </div>

        <Tabs
          value={mode}
          onValueChange={(v) => {
            const next = v as Mode;
            setMode(next);
            if (next !== "upload") {
              setFile(null);
              form.clearErrors("filePath");
            }
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="link">Lien externe</TabsTrigger>
            <TabsTrigger value="manual">Chemin manuel</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4 pb-6">
              <div className="space-y-2">
                <div className="text-sm font-semibold">Source du document</div>
                <div className="text-xs text-muted-foreground">
                  Choisissez comment le document sera rattaché (upload, lien externe, ou chemin existant).
                </div>
              </div>

              <TabsContent value="upload" className="space-y-3">
                <DocumentUploadZone selectedFile={file} onFileSelect={setFile} />
                {form.formState.errors.filePath?.message ? (
                  <div className="text-sm text-destructive">
                    {form.formState.errors.filePath.message}
                  </div>
                ) : null}

                {file && localPreviewUrl ? (
                  <div className="rounded-xl border bg-muted/10 p-4">
                    <div className="text-sm font-medium">Aperçu local</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {file.name}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(localPreviewUrl, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ouvrir
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const a = window.document.createElement("a");
                          a.href = localPreviewUrl;
                          a.download = file.name;
                          a.rel = "noopener";
                          a.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const w = window.open(localPreviewUrl, "_blank", "noopener,noreferrer");
                          if (!w) return;
                          const doPrint = () => {
                            w.focus();
                            w.print();
                          };
                          // Some browsers need a small delay even after onload for PDFs.
                          w.onload = () => setTimeout(doPrint, 250);
                          setTimeout(doPrint, 1200);
                        }}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimer
                      </Button>
                    </div>
                    <div className="mt-3 rounded-lg overflow-hidden border bg-background">
                      {file.type === "application/pdf" ? (
                        <iframe title="preview" src={localPreviewUrl} className="w-full h-64" />
                      ) : file.type.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={localPreviewUrl} alt="Aperçu" className="w-full max-h-64 object-contain" />
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground">
                          Aperçu non disponible pour ce type de fichier.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </TabsContent>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-semibold">Informations</div>
                <div className="text-xs text-muted-foreground">
                  Renseignez les métadonnées nécessaires au classement.
                </div>
              </div>

              <TabsContent value="link" className="space-y-3">
                <FormField
                  control={form.control}
                  name="externalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL externe</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormDescription>Le document pointera vers un lien externe.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="manual" className="space-y-3">
                <FormField
                  control={form.control}
                  name="filePath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chemin</FormLabel>
                      <FormControl>
                        <Input placeholder="/chemin/vers/fichier.pdf" {...field} />
                      </FormControl>
                      <FormDescription>
                        Si le fichier est déjà référencé côté stockage.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre du document" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referenceCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Référence</FormLabel>
                      <FormControl>
                        <Input placeholder="REF-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Département</FormLabel>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={String(d.id)}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="documentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Brouillon</SelectItem>
                          <SelectItem value="VALIDATED">Validé</SelectItem>
                          <SelectItem value="ARCHIVED">Archivé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={!!activeValue}
                  onChange={(e) => form.setValue("active", e.target.checked)}
                />
                <label htmlFor="active" className="text-sm">
                  Document actif
                </label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={!!isLoading}>
                  {isEdit ? "Enregistrer" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
