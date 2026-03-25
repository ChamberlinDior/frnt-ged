"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Download,
  Expand,
  Eye,
  FileArchive,
  FileCog,
  FileCode2,
  FileImage,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  Film,
  Layers3,
  Music4,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { useCategories } from "@/shared/api/hooks/useCategories";
import { useDepartments } from "@/shared/api/hooks/useDepartments";

import type {
  DocumentItem,
  DocumentRequest,
  DocumentUploadRequest,
} from "@/shared/api/resources/document";
import {
  createDocument,
  createDocumentExternalLink,
  createDocumentWithUpload,
  deleteDocument,
  updateDocument,
  updateDocumentExternalLink,
  updateDocumentWithUpload,
} from "@/shared/api/resources/document";

import { DocumentsHeader } from "@/features/documents/components/DocumentsHeader";
import { DocumentsTable } from "@/features/documents/components/DocumentsTable";
import { DocumentFormDialog } from "@/features/documents/components/DocumentFormDialog";
import { DocumentsToolbar } from "@/features/documents/components/DocumentsToolbar";
import { useDocumentsWithFilters } from "@/features/documents/hooks/useDocumentsWithFilters";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Mode = "upload" | "link" | "manual";

type MediaKind =
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "text"
  | "office"
  | "archive"
  | "other";

type DocumentWithPreview = DocumentItem & {
  previewUrl?: string | null;
};

function formatDate(date?: string | null) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function inferTitleFromFileName(filename?: string | null) {
  if (!filename) return "";
  const withoutExtension = filename.replace(/\.[^/.]+$/, "");
  return withoutExtension.replace(/[_-]+/g, " ").trim();
}

function isAbsoluteHttpUrl(value?: string | null) {
  return !!value && /^https?:\/\//i.test(value);
}

function isLocalUrl(value?: string | null) {
  if (!value) return false;
  return (
    value.startsWith("/") ||
    value.includes("localhost") ||
    value.includes("127.0.0.1")
  );
}

function stripQueryAndHash(value?: string | null) {
  if (!value) return "";
  return value.split("#")[0].split("?")[0];
}

function normalizeUrl(value?: string | null) {
  return (value || "").trim();
}

function replaceEndpointPath(url: string, target: "preview" | "open" | "download") {
  if (!url) return "";
  if (url.includes("/preview")) return url.replace("/preview", `/${target}`);
  if (url.includes("/open")) return url.replace("/open", `/${target}`);
  if (url.includes("/download")) return url.replace("/download", `/${target}`);
  return url;
}

function buildDerivedPreviewUrl(doc: DocumentItem) {
  const typedDoc = doc as DocumentWithPreview;

  if (typedDoc.previewUrl) return typedDoc.previewUrl;

  if (doc.openUrl && (doc.openUrl.includes("/open") || doc.openUrl.includes("/download"))) {
    return replaceEndpointPath(doc.openUrl, "preview");
  }

  if (doc.downloadUrl && (doc.downloadUrl.includes("/download") || doc.downloadUrl.includes("/open"))) {
    return replaceEndpointPath(doc.downloadUrl, "preview");
  }

  return "";
}

function getFileExtension(doc: DocumentItem) {
  const typedDoc = doc as DocumentWithPreview;
  const source =
    doc.originalFileName ||
    typedDoc.previewUrl ||
    doc.downloadUrl ||
    doc.openUrl ||
    doc.filePath ||
    doc.externalUrl ||
    "";
  const clean = stripQueryAndHash(source);
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function getMediaKind(doc: DocumentItem): MediaKind {
  const mime = (doc.mimeType || "").toLowerCase();
  const ext = getFileExtension(doc);

  if (mime.includes("pdf") || ext === "pdf") return "pdf";

  if (
    mime.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "tif", "tiff"].includes(ext)
  ) {
    return "image";
  }

  if (
    mime.startsWith("video/") ||
    ["mp4", "webm", "ogg", "mov", "m4v", "avi", "mkv"].includes(ext)
  ) {
    return "video";
  }

  if (
    mime.startsWith("audio/") ||
    ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(ext)
  ) {
    return "audio";
  }

  if (
    mime.startsWith("text/") ||
    [
      "txt",
      "csv",
      "json",
      "xml",
      "md",
      "log",
      "html",
      "htm",
      "yml",
      "yaml",
      "ini",
      "properties",
      "sql",
      "java",
      "js",
      "ts",
      "tsx",
      "jsx",
      "css",
    ].includes(ext)
  ) {
    return "text";
  }

  if (
    [
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "odt",
      "ods",
      "odp",
      "rtf",
    ].includes(ext) ||
    mime.includes("word") ||
    mime.includes("excel") ||
    mime.includes("powerpoint") ||
    mime.includes("officedocument") ||
    mime.includes("opendocument")
  ) {
    return "office";
  }

  if (
    ["zip", "rar", "7z", "tar", "gz"].includes(ext) ||
    mime.includes("zip") ||
    mime.includes("rar") ||
    mime.includes("compressed")
  ) {
    return "archive";
  }

  return "other";
}

function getDocumentPreviewUrl(doc: DocumentItem) {
  const typedDoc = doc as DocumentWithPreview;
  const kind = getMediaKind(doc);

  if (kind === "office") {
    return normalizeUrl(buildDerivedPreviewUrl(doc));
  }

  if (kind === "pdf") {
    return normalizeUrl(
      typedDoc.previewUrl || doc.openUrl || doc.externalUrl || doc.filePath || doc.downloadUrl || ""
    );
  }

  if (kind === "image" || kind === "video" || kind === "audio" || kind === "text") {
    return normalizeUrl(
      typedDoc.previewUrl || doc.openUrl || doc.filePath || doc.externalUrl || doc.downloadUrl || ""
    );
  }

  return normalizeUrl(typedDoc.previewUrl || doc.openUrl || doc.externalUrl || doc.filePath || "");
}

function getDocumentOpenUrl(doc: DocumentItem) {
  return normalizeUrl(doc.openUrl || doc.externalUrl || doc.filePath || doc.downloadUrl || "");
}

function getDocumentDownloadUrl(doc: DocumentItem) {
  return normalizeUrl(doc.downloadUrl || doc.openUrl || doc.externalUrl || doc.filePath || "");
}

function getMediaLabel(kind: MediaKind) {
  switch (kind) {
    case "pdf":
      return "Document PDF";
    case "image":
      return "Image";
    case "video":
      return "Vidéo";
    case "audio":
      return "Audio";
    case "text":
      return "Texte / code";
    case "office":
      return "Document bureautique";
    case "archive":
      return "Archive compressée";
    default:
      return "Fichier";
  }
}

function getMediaIcon(kind: MediaKind) {
  switch (kind) {
    case "pdf":
      return FileText;
    case "image":
      return FileImage;
    case "video":
      return Film;
    case "audio":
      return Music4;
    case "text":
      return FileCode2;
    case "office":
      return FileSpreadsheet;
    case "archive":
      return FileArchive;
    default:
      return FileText;
  }
}

function buildOfficeViewerUrl(rawUrl: string) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(rawUrl)}`;
}

function TextPreview({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function loadText() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(url, { method: "GET" });
        if (!response.ok) {
          throw new Error(`Impossible de charger le texte (${response.status})`);
        }

        const text = await response.text();
        if (!mounted) return;
        setContent(text);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Erreur de lecture");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadText();

    return () => {
      mounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-[24px] border border-slate-200 bg-white p-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Chargement du contenu texte…</p>
          <p className="mt-2 text-sm text-slate-600">{title}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 p-8">
        <div className="max-w-2xl rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Lecture texte indisponible</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950">
      <div className="h-full overflow-auto p-4">
        <pre className="min-h-full whitespace-pre-wrap break-words rounded-2xl bg-slate-900 p-5 font-mono text-sm leading-6 text-slate-100">
          {content || "Fichier texte vide."}
        </pre>
      </div>
    </div>
  );
}

function OfficePreview({
  previewUrl,
  openUrl,
  fileName,
}: {
  previewUrl: string;
  openUrl?: string;
  fileName?: string | null;
}) {
  const safePreviewUrl = normalizeUrl(previewUrl);
  const safeOpenUrl = normalizeUrl(openUrl);

  const hasBackendPreview =
    !!safePreviewUrl &&
    (
      safePreviewUrl.includes("/preview") ||
      stripQueryAndHash(safePreviewUrl).endsWith(".pdf")
    );

  const isEmbeddablePublicOffice =
    !!safeOpenUrl &&
    isAbsoluteHttpUrl(safeOpenUrl) &&
    !safeOpenUrl.includes("localhost") &&
    !safeOpenUrl.includes("127.0.0.1");

  if (hasBackendPreview) {
    return (
      <div className="h-full overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <iframe
          title={fileName || "Office preview"}
          src={safePreviewUrl}
          className="h-full w-full"
        />
      </div>
    );
  }

  if (isEmbeddablePublicOffice) {
    return (
      <div className="h-full overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <iframe
          title={fileName || "Office preview"}
          src={buildOfficeViewerUrl(safeOpenUrl)}
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 p-8">
      <div className="max-w-2xl rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Aperçu bureautique indisponible</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Le navigateur ne peut pas afficher directement un fichier Word, Excel ou PowerPoint brut.
          Pour l’afficher dans l’application, le backend doit exposer un endpoint de prévisualisation
          converti en PDF, par exemple <span className="font-medium">/api/files/documents/id/preview</span>.
        </p>
        {fileName ? <p className="mt-3 text-xs text-slate-500">{fileName}</p> : null}
      </div>
    </div>
  );
}

function ArchivePreview({
  doc,
}: {
  doc: DocumentItem;
}) {
  return (
    <div className="flex h-full items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 p-8">
      <div className="w-full max-w-3xl rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <FileArchive className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Archive détectée</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Les archives compressées ne sont pas lisibles nativement dans l’aperçu du navigateur.
              Tu peux toutefois ouvrir, télécharger et manipuler ce fichier depuis son application dédiée.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Nom</div>
                <div className="mt-2 break-words text-sm font-medium text-slate-900">
                  {doc.originalFileName || doc.title}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Référence</div>
                <div className="mt-2 text-sm font-medium text-slate-900">{doc.referenceCode}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderPreviewContent(doc: DocumentItem) {
  const previewUrl = getDocumentPreviewUrl(doc);
  const openUrl = getDocumentOpenUrl(doc);
  const kind = getMediaKind(doc);

  if (!previewUrl && kind !== "archive" && kind !== "other") {
    return (
      <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-900">Aucun aperçu disponible</p>
          <p className="mt-2 text-sm text-slate-600">
            Ce document ne fournit pas d’URL d’aperçu exploitable directement dans l’application.
          </p>
        </div>
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div className="flex h-full items-center justify-center overflow-auto rounded-[24px] border border-slate-200 bg-slate-950/95 p-4">
        <img
          src={previewUrl}
          alt={doc.title}
          className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
        />
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div className="flex h-full items-center justify-center rounded-[24px] border border-slate-200 bg-black p-4">
        <video
          src={previewUrl}
          controls
          preload="metadata"
          className="h-full max-h-full w-full max-w-full rounded-2xl bg-black"
        >
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      </div>
    );
  }

  if (kind === "audio") {
    return (
      <div className="flex h-full items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 p-8">
        <div className="w-full max-w-3xl rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <Music4 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{doc.title}</div>
              <div className="text-xs text-slate-500">Lecture audio intégrée</div>
            </div>
          </div>
          <audio src={previewUrl} controls className="w-full">
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <div className="h-full overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <iframe title={doc.title} src={previewUrl} className="h-full w-full" />
      </div>
    );
  }

  if (kind === "text") {
    return <TextPreview url={previewUrl} title={doc.title} />;
  }

  if (kind === "office") {
    return (
      <OfficePreview
        previewUrl={previewUrl}
        openUrl={openUrl}
        fileName={doc.originalFileName}
      />
    );
  }

  if (kind === "archive") {
    return <ArchivePreview doc={doc} />;
  }

  return (
    <div className="flex h-full items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 p-8">
      <div className="max-w-2xl rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Type de fichier non pris en charge directement</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          L’application lit les PDF, images, vidéos, audios, textes et documents bureautiques
          uniquement lorsqu’un vrai endpoint d’aperçu est disponible. Pour ce format précis,
          utilise le bouton d’ouverture ou de téléchargement.
        </p>
      </div>
    </div>
  );
}

function FullscreenDocumentPreview({
  document,
  onClose,
}: {
  document: DocumentItem | null;
  onClose: () => void;
}) {
  if (!document) return null;

  const kind = getMediaKind(document);
  const Icon = getMediaIcon(kind);
  const previewUrl = getDocumentPreviewUrl(document);
  const openUrl = getDocumentOpenUrl(document);
  const downloadUrl = getDocumentDownloadUrl(document);

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm">
      <div className="flex h-full flex-col p-3 md:p-5">
        <div className="mb-3 rounded-[24px] border border-white/10 bg-slate-900/90 p-4 shadow-2xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {getMediaLabel(kind)}
                </div>
                <h2 className="truncate text-xl font-semibold text-white">{document.title}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{document.referenceCode}</span>
                  <span>•</span>
                  <span>{document.categoryName ?? "Sans catégorie"}</span>
                  <span>•</span>
                  <span>{formatDate(document.documentDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/15"
                >
                  <Eye className="h-4 w-4" />
                  Ouvrir l’aperçu
                </a>
              )}

              {openUrl && (
                <a
                  href={openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/15"
                >
                  <Expand className="h-4 w-4" />
                  Ouvrir dans un onglet
                </a>
              )}

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/15"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition-all hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
                Fermer
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1">{renderPreviewContent(document)}</div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const departmentIdFromUrl = searchParams.get("departmentId");
  const parsedDepartmentId = departmentIdFromUrl ? Number(departmentIdFromUrl) : undefined;
  const isDepartmentFocused = !!parsedDepartmentId;

  const {
    documents,
    total,
    isLoading,
    filters,
    updateFilter,
  } = useDocumentsWithFilters();

  const { data: departments = [], isLoading: deptsLoading } = useDepartments();

  const selectedDepartmentId =
    typeof filters.departmentId === "number"
      ? filters.departmentId
      : filters.departmentId
      ? Number(filters.departmentId)
      : undefined;

  const selectedDepartment = departments.find((d) => d.id === selectedDepartmentId);

  useEffect(() => {
    if (parsedDepartmentId) {
      if (selectedDepartmentId !== parsedDepartmentId) {
        updateFilter("departmentId", parsedDepartmentId);
        updateFilter("page", 1);
      }
      return;
    }
  }, [parsedDepartmentId, selectedDepartmentId, updateFilter]);

  const { data: allCategories = [], isLoading: catsLoading } = useCategories({
    departmentId: selectedDepartmentId,
  });

  const categories = useMemo(() => {
    if (!selectedDepartmentId) return allCategories;
    return allCategories.filter((c) => c.departmentId === selectedDepartmentId);
  }, [allCategories, selectedDepartmentId]);

  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const scopedStats = useMemo(() => {
    const source = documents ?? [];
    return {
      total: source.length,
      active: source.filter((d) => d.active).length,
      validated: source.filter((d) => (d.status ?? "").toUpperCase() === "VALIDATED").length,
      archived: source.filter((d) => (d.status ?? "").toUpperCase() === "ARCHIVED").length,
    };
  }, [documents]);

  const allForStats = useMemo(() => {
    if (isDepartmentFocused) {
      return documents ?? [];
    }
    const cached = queryClient.getQueryData<DocumentItem[]>(["documents"]);
    return cached ?? documents ?? [];
  }, [queryClient, documents, isDepartmentFocused]);

  const categoriesSimple = categories.map((c) => ({ id: c.id, name: c.name }));
  const departmentsSimple = isDepartmentFocused
    ? departments.filter((d) => d.id === selectedDepartmentId).map((d) => ({ id: d.id, name: d.name }))
    : departments.map((d) => ({ id: d.id, name: d.name }));

  const handleCreate = async (
    payload: DocumentRequest | DocumentUploadRequest,
    mode: Mode
  ) => {
    setIsSaving(true);
    try {
      const finalPayload = {
        ...payload,
        departmentId: isDepartmentFocused
          ? selectedDepartmentId ?? payload.departmentId
          : payload.departmentId,
      };

      if (mode === "upload") {
        const uploadPayload = finalPayload as DocumentUploadRequest;
        if (!uploadPayload.title?.trim()) {
          uploadPayload.title =
            inferTitleFromFileName(uploadPayload.file?.name) || "Nouveau document";
        }
        await createDocumentWithUpload(uploadPayload);
      } else if (mode === "link") {
        await createDocumentExternalLink(finalPayload as DocumentRequest);
      } else {
        await createDocument(finalPayload as DocumentRequest);
      }

      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document créé", {
        description: "Le document a été ajouté avec une référence générée automatiquement.",
      });
      setIsCreateOpen(false);
    } catch (e) {
      toast.error("Erreur", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (
    id: number,
    payload: DocumentRequest | DocumentUploadRequest,
    mode: Mode
  ) => {
    setIsSaving(true);
    try {
      const finalPayload = {
        ...payload,
        departmentId: isDepartmentFocused
          ? selectedDepartmentId ?? payload.departmentId
          : payload.departmentId,
      };

      if (mode === "upload") {
        const uploadPayload = finalPayload as DocumentUploadRequest;
        if (!uploadPayload.title?.trim()) {
          uploadPayload.title =
            inferTitleFromFileName(uploadPayload.file?.name) || "Document média";
        }
        await updateDocumentWithUpload(id, uploadPayload);
      } else if (mode === "link") {
        await updateDocumentExternalLink(id, finalPayload as DocumentRequest);
      } else {
        await updateDocument(id, finalPayload as DocumentRequest);
      }

      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document mis à jour", {
        description: "Les modifications ont été enregistrées.",
      });
      setEditingDoc(undefined);
    } catch (e) {
      toast.error("Erreur", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDoc) return;
    try {
      await deleteDocument(deletingDoc.id);
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document supprimé");
    } catch (e) {
      toast.error("Erreur", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setDeletingDoc(null);
    }
  };

  const handleDownload = (doc: DocumentItem) => {
    const url = getDocumentDownloadUrl(doc);

    if (!url) {
      toast.error("Téléchargement indisponible", {
        description: "Aucune URL de téléchargement.",
      });
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleResetFilters = () => {
    updateFilter("search", undefined);
    updateFilter("status", "all");
    updateFilter("categoryId", undefined);
    updateFilter("active", undefined);
    updateFilter("page", 1);

    if (isDepartmentFocused) {
      updateFilter("departmentId", parsedDepartmentId);
    } else {
      updateFilter("departmentId", undefined);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.15),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_30%)]" />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>

            {selectedDepartment && (
              <Link
                href={`/departments?departmentId=${selectedDepartment.id}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
              >
                <Building2 className="h-4 w-4" />
                Retour au département
              </Link>
            )}

            {selectedDepartment && (
              <Link
                href={`/categories?departmentId=${selectedDepartment.id}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
              >
                <Layers3 className="h-4 w-4" />
                Voir les catégories
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                <FileCog className="h-3.5 w-3.5 text-blue-600" />
                {isDepartmentFocused ? "Documents du département" : "Orchestration documentaire"}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {isDepartmentFocused && selectedDepartment
                  ? `Documents du département ${selectedDepartment.name}`
                  : "Documents reliés au bon département et à la bonne catégorie"}
              </h1>

              <p className="max-w-4xl text-sm leading-7 text-slate-600">
                {isDepartmentFocused && selectedDepartment
                  ? `Cette vue est focalisée sur ${selectedDepartment.name}. Tous les documents visibles ici appartiennent uniquement à ce département, et les catégories proposées correspondent seulement à ce même département.`
                  : "La lecture documentaire devient plus fiable : les documents sont contextualisés, mieux filtrés, mieux classés et plus simples à retrouver."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Documents</div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">
                  {scopedStats.total}
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Actifs</div>
                <div className="mt-2 text-3xl font-semibold text-emerald-600">
                  {scopedStats.active}
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Validés</div>
                <div className="mt-2 text-3xl font-semibold text-blue-600">
                  {scopedStats.validated}
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Archivés</div>
                <div className="mt-2 text-3xl font-semibold text-violet-600">
                  {scopedStats.archived}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm xl:col-span-2">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Aperçu enrichi multi-formats
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                L’aperçu prend en charge les PDF, images, vidéos, audios, textes et documents
                bureautiques seulement via une vraie URL d’aperçu backend.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Logique premium
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedDepartment
                  ? `Le département ${selectedDepartment.name} pilote cette vue, ses catégories visibles et la cohérence de création.`
                  : "Un département choisi doit piloter les catégories visibles et la cohérence de création."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedDepartment && (
        <div className="rounded-[24px] border border-blue-100 bg-gradient-to-r from-blue-50 to-violet-50 px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 text-blue-700 shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Département actuellement ciblé
                </div>
                <div className="text-base font-semibold text-slate-900">
                  {selectedDepartment.name}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/categories?departmentId=${selectedDepartment.id}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
              >
                <Layers3 className="h-4 w-4" />
                Ajouter / voir les catégories
              </Link>

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <FilePlus2 className="h-4 w-4" />
                Ajouter un document
              </button>
            </div>
          </div>
        </div>
      )}

      <DocumentsHeader
        documents={allForStats}
        total={allForStats.length}
        onNewDocument={() => setIsCreateOpen(true)}
      />

      <DocumentsToolbar
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === "departmentId" && isDepartmentFocused) {
            updateFilter("departmentId", parsedDepartmentId);
            return;
          }
          updateFilter(key, value);
        }}
        categories={categoriesSimple}
        departments={departmentsSimple}
        totalDocuments={total}
        onResetFilters={handleResetFilters}
      />

      <div className="rounded-[24px] border border-white/70 bg-white/80 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <DocumentsTable
          documents={documents}
          total={total}
          isLoading={isLoading || catsLoading || deptsLoading || isSaving}
          filters={filters}
          onFilterChange={(key, value) => {
            if (key === "departmentId" && isDepartmentFocused) {
              updateFilter("departmentId", parsedDepartmentId);
              return;
            }
            updateFilter(key, value);
          }}
          onView={(doc) => setPreviewDoc(doc)}
          onDownload={handleDownload}
          onEdit={(doc) => setEditingDoc(doc)}
          onDelete={(doc) => setDeletingDoc(doc)}
        />
      </div>

      <FullscreenDocumentPreview document={previewDoc} onClose={() => setPreviewDoc(null)} />

      <DocumentFormDialog
        key={`${editingDoc?.id ?? "new"}-${selectedDepartmentId ?? "global"}`}
        open={isCreateOpen || !!editingDoc}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingDoc(undefined);
          }
        }}
        document={editingDoc}
        categories={categories}
        departments={isDepartmentFocused && selectedDepartment ? [selectedDepartment] : departments}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        isLoading={isSaving}
      />

      <AlertDialog open={!!deletingDoc} onOpenChange={(open) => !open && setDeletingDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le document sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}