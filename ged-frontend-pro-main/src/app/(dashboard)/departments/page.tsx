"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Building2,
  CheckCircle2,
  CircleDot,
  Clock3,
  Eye,
  FileBadge2,
  FilePlus2,
  FileStack,
  FileText,
  Filter,
  FolderOpen,
  FolderTree,
  Layers3,
  ListTree,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";

import { useDepartments } from "@/shared/api/hooks/useDepartments";
import { useCategories } from "@/shared/api/hooks/useCategories";
import { useDocuments } from "@/shared/api/hooks/useDocuments";
import {
  createDepartment,
  type DepartmentRequest,
} from "@/shared/api/resources/department";
import type { DocumentItem } from "@/shared/api/resources/document";

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

function formatFileSize(value?: number | null) {
  if (!value || value <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function getStatusClasses(status?: string | null) {
  const normalized = (status ?? "").toUpperCase();

  if (normalized === "VALIDATED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "ARCHIVED") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function buildCategoryHref(departmentId: number) {
  return `/categories?departmentId=${departmentId}`;
}

function buildDocumentHref(departmentId: number) {
  return `/documents?departmentId=${departmentId}`;
}

function buildDocumentHrefWithCategory(departmentId: number, categoryId: number) {
  return `/documents?departmentId=${departmentId}&categoryId=${categoryId}`;
}

function getDepartmentTheme(index: number) {
  const variants = [
    {
      glow: "from-blue-500/20 via-cyan-400/10 to-transparent",
      icon: "from-blue-600 to-cyan-500",
      ring: "ring-blue-100",
    },
    {
      glow: "from-violet-500/20 via-fuchsia-400/10 to-transparent",
      icon: "from-violet-600 to-fuchsia-500",
      ring: "ring-violet-100",
    },
    {
      glow: "from-emerald-500/20 via-teal-400/10 to-transparent",
      icon: "from-emerald-600 to-teal-500",
      ring: "ring-emerald-100",
    },
    {
      glow: "from-amber-500/20 via-orange-400/10 to-transparent",
      icon: "from-amber-500 to-orange-500",
      ring: "ring-amber-100",
    },
  ];

  return variants[index % variants.length];
}

export default function DepartmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const departmentIdFromUrl = searchParams.get("departmentId");
  const parsedDepartmentId = departmentIdFromUrl ? Number(departmentIdFromUrl) : undefined;

  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();

  const selectedDepartment = useMemo(() => {
    if (!parsedDepartmentId) return null;
    return departments.find((item) => item.id === parsedDepartmentId) ?? null;
  }, [departments, parsedDepartmentId]);

  const { data: departmentCategories = [], isLoading: categoriesLoading } = useCategories({
    departmentId: selectedDepartment?.id,
  });

  const { data: departmentDocuments = [], isLoading: documentsLoading } = useDocuments({
    departmentId: selectedDepartment?.id,
  });

  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "DRAFT" | "VALIDATED" | "ARCHIVED">("all");
  const [activeOnly, setActiveOnly] = useState(false);

  const [isCreateDepartmentOpen, setIsCreateDepartmentOpen] = useState(false);
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [departmentForm, setDepartmentForm] = useState<DepartmentRequest>({
    name: "",
    description: "",
    active: true,
  });

  const filteredDocuments = useMemo(() => {
    let result = departmentDocuments;

    if (categoryFilter !== "all") {
      result = result.filter((doc) => doc.categoryId === categoryFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((doc) => (doc.status ?? "").toUpperCase() === statusFilter);
    }

    if (activeOnly) {
      result = result.filter((doc) => !!doc.active);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((doc) => {
        const bag = [
          doc.title,
          doc.referenceCode,
          doc.description,
          doc.categoryName,
          doc.departmentName,
          doc.status,
          doc.originalFileName,
          doc.mimeType,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return bag.includes(q);
      });
    }

    return result;
  }, [departmentDocuments, categoryFilter, statusFilter, activeOnly, search]);

  const departmentStats = useMemo(() => {
    const activeDocuments = departmentDocuments.filter((doc) => doc.active);
    const validatedDocuments = departmentDocuments.filter(
      (doc) => (doc.status ?? "").toUpperCase() === "VALIDATED"
    );
    const archivedDocuments = departmentDocuments.filter(
      (doc) => (doc.status ?? "").toUpperCase() === "ARCHIVED"
    );

    return {
      categories: departmentCategories.length,
      documents: departmentDocuments.length,
      activeDocuments: activeDocuments.length,
      validatedDocuments: validatedDocuments.length,
      archivedDocuments: archivedDocuments.length,
    };
  }, [departmentCategories, departmentDocuments]);

  const selectedCategoryLabel = useMemo(() => {
    if (categoryFilter === "all") return "Toutes les catégories";
    return (
      departmentCategories.find((item) => item.id === categoryFilter)?.name ?? "Catégorie inconnue"
    );
  }, [categoryFilter, departmentCategories]);

  const globalStats = useMemo(() => {
    return {
      total: departments.length,
      active: departments.filter((item) => item.active).length,
      inactive: departments.filter((item) => !item.active).length,
    };
  }, [departments]);

  const handleOpenDocument = (doc: DocumentItem) => {
    if (!doc.openUrl) {
      toast.error("Ouverture indisponible", {
        description: "Aucune URL d’ouverture n’est disponible pour ce document.",
      });
      return;
    }
    window.open(doc.openUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadDocument = (doc: DocumentItem) => {
    if (!doc.downloadUrl) {
      toast.error("Téléchargement indisponible", {
        description: "Aucune URL de téléchargement n’est disponible pour ce document.",
      });
      return;
    }
    window.open(doc.downloadUrl, "_blank", "noopener,noreferrer");
  };

  const resetFilters = () => {
    setCategoryFilter("all");
    setSearch("");
    setStatusFilter("all");
    setActiveOnly(false);
  };

  const resetDepartmentForm = () => {
    setDepartmentForm({
      name: "",
      description: "",
      active: true,
    });
  };

  const handleCreateDepartment = async () => {
    if (!departmentForm.name.trim()) {
      toast.error("Nom requis", {
        description: "Le nom du département est obligatoire.",
      });
      return;
    }

    setIsCreatingDepartment(true);
    try {
      const created = await createDepartment({
        name: departmentForm.name.trim(),
        description: departmentForm.description?.trim() || "",
        active: departmentForm.active,
      });

      await queryClient.invalidateQueries({ queryKey: ["departments"] });

      toast.success("Département créé", {
        description: "Le nouveau département a bien été ajouté.",
      });

      setIsCreateDepartmentOpen(false);
      resetDepartmentForm();
      router.push(`/departments?departmentId=${created.id}`);
    } catch (e) {
      toast.error("Erreur", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setIsCreatingDepartment(false);
    }
  };

  if (parsedDepartmentId && selectedDepartment) {
    return (
      <div className="space-y-6 p-6">
        <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.16),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.10),_transparent_30%)]" />
          <div className="relative space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </button>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
                  >
                    <Building2 className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsCreateDepartmentOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un département
                  </button>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm">
                  <Building2 className="h-3.5 w-3.5 text-blue-600" />
                  Département ciblé
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                    {selectedDepartment.name}
                  </h1>
                  <p className="max-w-4xl text-sm leading-7 text-slate-600 md:text-base">
                    {selectedDepartment.description?.trim()
                      ? selectedDepartment.description
                      : "Espace documentaire premium du département sélectionné, avec filtrage intelligent par catégorie, accès rapide aux catégories et aux documents, et visualisation concentrée sur les contenus de ce département uniquement."}
                  </p>
                </div>
              </div>

              <div className="grid min-w-[320px] gap-3 sm:grid-cols-2 xl:w-[520px]">
                <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Catégories</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-900">
                    {departmentStats.categories}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Documents</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-900">
                    {departmentStats.documents}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Actifs</div>
                  <div className="mt-2 text-3xl font-semibold text-emerald-600">
                    {departmentStats.activeDocuments}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Validés</div>
                  <div className="mt-2 text-3xl font-semibold text-blue-600">
                    {departmentStats.validatedDocuments}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[24px] border border-white/70 bg-white/82 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                    <FolderTree className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Catégories du département
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Toutes les catégories liées à ce département s’affichent ici. Tu peux cliquer
                      dessus pour filtrer immédiatement le tableau documentaire.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setCategoryFilter("all")}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          categoryFilter === "all"
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        Toutes les catégories
                      </button>

                      {departmentCategories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setCategoryFilter(category.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                            categoryFilter === category.id
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>

                    {departmentCategories.length === 0 && !categoriesLoading && (
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-4 text-sm text-slate-600">
                        Aucune catégorie n’est encore rattachée à ce département.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/82 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Actions du département
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Depuis cette page, tu peux gérer clairement les catégories, les documents et les accès rapides liés à ce département.
                    </p>

                    <div className="mt-4 grid gap-3">
                      <Link
                        href={buildCategoryHref(selectedDepartment.id)}
                        className="inline-flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 transition-all hover:-translate-y-0.5 hover:border-blue-300"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Layers3 className="h-4 w-4" />
                          Ajouter une catégorie
                        </span>
                        <Plus className="h-4 w-4" />
                      </Link>

                      <Link
                        href={buildCategoryHref(selectedDepartment.id)}
                        className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-300"
                      >
                        <span className="inline-flex items-center gap-2">
                          <ListTree className="h-4 w-4" />
                          Voir toutes les catégories
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <Link
                        href={buildDocumentHref(selectedDepartment.id)}
                        className="inline-flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700 transition-all hover:-translate-y-0.5 hover:border-violet-300"
                      >
                        <span className="inline-flex items-center gap-2">
                          <FilePlus2 className="h-4 w-4" />
                          Ajouter un document
                        </span>
                        <Plus className="h-4 w-4" />
                      </Link>

                      <Link
                        href={buildDocumentHref(selectedDepartment.id)}
                        className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-300"
                      >
                        <span className="inline-flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Voir tous les documents
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setIsCreateDepartmentOpen(true)}
                        className="inline-flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 transition-all hover:-translate-y-0.5 hover:border-amber-300"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Ajouter un département
                        </span>
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm xl:col-span-2">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <BookOpenText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Vue documentaire contextualisée
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Tous les documents ci-dessous appartiennent exclusivement à{" "}
                  <span className="font-semibold text-slate-900">{selectedDepartment.name}</span>.
                  Le filtrage par catégorie agit à l’intérieur même de ce département.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Filtre actif
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Catégorie sélectionnée :{" "}
                  <span className="font-semibold text-slate-900">{selectedCategoryLabel}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Layers3 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Accès direct aux catégories
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ouvre immédiatement la page des catégories du département, soit pour toutes les consulter, soit pour en ajouter une nouvelle.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={buildCategoryHref(selectedDepartment.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-all hover:-translate-y-0.5 hover:border-blue-300"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter une catégorie
                  </Link>

                  <Link
                    href={buildCategoryHref(selectedDepartment.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-300"
                  >
                    <Layers3 className="h-4 w-4" />
                    Voir toutes les catégories
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Accès direct aux documents
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ouvre rapidement tous les documents du département ou ses documents filtrés depuis une catégorie donnée.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={buildDocumentHref(selectedDepartment.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 transition-all hover:-translate-y-0.5 hover:border-violet-300"
                  >
                    <FilePlus2 className="h-4 w-4" />
                    Ajouter un document
                  </Link>

                  <Link
                    href={buildDocumentHref(selectedDepartment.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-300"
                  >
                    <FileText className="h-4 w-4" />
                    Voir tous les documents
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                <Filter className="h-3.5 w-3.5 text-blue-600" />
                Pilotage documentaire
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Documents du département
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">
                Recherche multi-colonnes, filtre par catégorie, statut, activité, ouverture, téléchargement
                et vision structurée du contexte documentaire.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
              >
                <RefreshCcw className="h-4 w-4" />
                Réinitialiser
              </button>

              <Link
                href={buildCategoryHref(selectedDepartment.id)}
                className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-all hover:-translate-y-0.5 hover:border-blue-300"
              >
                <Layers3 className="h-4 w-4" />
                Voir les catégories
              </Link>

              <Link
                href={buildDocumentHref(selectedDepartment.id)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <FileText className="h-4 w-4" />
                Voir tous les documents
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Recherche globale
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Titre, référence, catégorie..."
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Catégorie
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                <Layers3 className="h-4 w-4 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value === "all" ? "all" : Number(e.target.value))
                  }
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                >
                  <option value="all">Toutes les catégories</option>
                  {departmentCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Statut
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                <FileBadge2 className="h-4 w-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | "DRAFT" | "VALIDATED" | "ARCHIVED"
                    )
                  }
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="DRAFT">Brouillon</option>
                  <option value="VALIDATED">Validé</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Activité
              </label>
              <button
                type="button"
                onClick={() => setActiveOnly((prev) => !prev)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all ${
                  activeOnly
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <span>{activeOnly ? "Actifs uniquement" : "Tous les documents"}</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <div className="rounded-2xl border border-white/70 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Résultats</div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {filteredDocuments.length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-gradient-to-br from-white to-blue-50 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Catégorie</div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {selectedCategoryLabel}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-gradient-to-br from-white to-emerald-50 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Mode activité</div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {activeOnly ? "Actifs uniquement" : "Vue complète"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-gradient-to-br from-white to-violet-50 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Recherche</div>
              <div className="mt-2 truncate text-base font-semibold text-slate-900">
                {search.trim() ? search : "Aucune"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-gradient-to-br from-white to-amber-50 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Archives</div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {departmentStats.archivedDocuments}
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[26px] border border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.92))]">
                    <th className="sticky top-0 z-10 border-b border-slate-200 px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                      Document
                    </th>
                    <th className="sticky top-0 z-10 border-b border-slate-200 px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                      Référence
                    </th>
                    <th className="sticky top-0 z-10 border-b border-slate-200 px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                      Catégorie
                    </th>
                    <th className="sticky top-0 z-10 border-b border-slate-200 px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                      Statut
                    </th>
                    <th className="sticky top-0 z-10 border-b border-slate-200 px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                      Date doc
                    </th>
                    <th className="sticky top-0 z-10 border-b border-slate-200 px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                      Taille
                    </th>
                    <th className="sticky top-0 z-10 border-b border-slate-200 px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                      Fichier
                    </th>
                    <th className="sticky top-0 z-10 border-b border-slate-200 px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                      Activité
                    </th>
                    <th className="sticky top-0 z-10 border-b border-slate-200 px-4 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {documentsLoading || categoriesLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 9 }).map((__, cellIndex) => (
                          <td key={cellIndex} className="border-b border-slate-100 px-4 py-4">
                            <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc, index) => (
                      <tr
                        key={doc.id}
                        className={`group transition-all hover:bg-blue-50/35 ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/35"
                        }`}
                      >
                        <td className="border-b border-slate-100 px-4 py-4 align-top">
                          <div className="flex min-w-[280px] items-start gap-3">
                            <div className="mt-0.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-2.5 text-white shadow-sm">
                              <FileStack className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-slate-900">
                                {doc.title}
                              </div>
                              <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                {doc.description?.trim()
                                  ? doc.description
                                  : "Aucune description disponible pour ce document."}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="border-b border-slate-100 px-4 py-4 align-top">
                          <div className="inline-flex rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                            {doc.referenceCode}
                          </div>
                        </td>

                        <td className="border-b border-slate-100 px-4 py-4 align-top">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (doc.categoryId) setCategoryFilter(doc.categoryId);
                              }}
                              className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700"
                            >
                              <CircleDot className="h-3 w-3" />
                              {doc.categoryName ?? "Sans catégorie"}
                            </button>
                          </div>
                        </td>

                        <td className="border-b border-slate-100 px-4 py-4 align-top">
                          <div
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                              doc.status
                            )}`}
                          >
                            {doc.status ?? "—"}
                          </div>
                        </td>

                        <td className="border-b border-slate-100 px-4 py-4 align-top">
                          <div className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <Clock3 className="h-4 w-4 text-slate-400" />
                            {formatDate(doc.documentDate)}
                          </div>
                        </td>

                        <td className="border-b border-slate-100 px-4 py-4 align-top text-sm text-slate-700">
                          {formatFileSize(doc.fileSize)}
                        </td>

                        <td className="border-b border-slate-100 px-4 py-4 align-top">
                          <div className="max-w-[220px]">
                            {doc.originalFileName ? (
                              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                                <Eye className="h-3.5 w-3.5" />
                                <span className="truncate">{doc.originalFileName}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </div>
                        </td>

                        <td className="border-b border-slate-100 px-4 py-4 align-top">
                          <div
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${
                              doc.active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {doc.active ? "Actif" : "Inactif"}
                          </div>
                        </td>

                        <td className="border-b border-slate-100 px-4 py-4 align-top">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenDocument(doc)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ouvrir
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadDocument(doc)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                              Télécharger
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-12">
                        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-500 shadow-sm">
                            <FolderOpen className="h-7 w-7" />
                          </div>
                          <h3 className="mt-4 text-xl font-semibold text-slate-900">
                            Aucun document trouvé
                          </h3>
                          <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                            Ce département ne contient encore aucun document correspondant aux filtres actuels.
                            Tu peux soit réinitialiser les filtres, soit ouvrir directement les catégories ou les documents du département.
                          </p>

                          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={resetFilters}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
                            >
                              <RefreshCcw className="h-4 w-4" />
                              Réinitialiser les filtres
                            </button>

                            <Link
                              href={buildCategoryHref(selectedDepartment.id)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-all hover:-translate-y-0.5 hover:border-blue-300"
                            >
                              <Layers3 className="h-4 w-4" />
                              Voir les catégories
                            </Link>

                            <Link
                              href={buildDocumentHref(selectedDepartment.id)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                            >
                              <FileText className="h-4 w-4" />
                              Voir tous les documents
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                <Layers3 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Vue rapide des catégories
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {departmentCategories.length > 0 ? (
                    departmentCategories.map((category) => (
                      <div
                        key={category.id}
                        className="rounded-2xl border border-white/70 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{category.name}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {category.active ? "Catégorie active" : "Catégorie inactive"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCategoryFilter(category.id)}
                            className="rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700"
                          >
                            Filtrer
                          </button>
                        </div>

                        <div className="mt-3 flex justify-end">
                          <Link
                            href={buildDocumentHrefWithCategory(selectedDepartment.id, category.id)}
                            className="text-xs font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
                          >
                            Voir les documents liés
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-sm text-slate-600">
                      Aucune catégorie disponible pour ce département.
                    </div>
                  )}
                </div>
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
                  Recommandation structurelle
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Dans cette vue, le département devient le vrai conteneur métier. Les catégories servent à affiner
                  la lecture, et les documents restent toujours contextualisés dans le bon espace métier.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.16),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.10),_transparent_30%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              Départements disponibles
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Sélectionne un département pour entrer dans son univers documentaire
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              Cette vue reste le sas d’entrée. Dès qu’un département est ouvert, tu accèdes à ses catégories,
              ses filtres et ses documents uniquement, tout en gardant la possibilité de créer un nouveau département.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsCreateDepartmentOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Ajouter un département
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Total</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{globalStats.total}</div>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Actifs</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-600">{globalStats.active}</div>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Inactifs</div>
          <div className="mt-2 text-3xl font-semibold text-amber-600">{globalStats.inactive}</div>
        </div>
      </section>

      {departmentsLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[220px] animate-pulse rounded-[26px] border border-white/70 bg-white/70 shadow-sm"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department, index) => {
            const theme = getDepartmentTheme(index);

            return (
              <Link
                key={department.id}
                href={`/departments?departmentId=${department.id}`}
                className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_70px_rgba(37,99,235,0.12)]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow} opacity-80`} />
                <div className="relative flex h-full flex-col">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.icon} text-white shadow-lg ring-4 ${theme.ring}`}>
                    <Building2 className="h-6 w-6" />
                  </div>

                  <div className="mt-5">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                      {department.name}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {department.description?.trim()
                        ? department.description
                        : "Département structuré pour accueillir ses catégories et ses documents dans une logique premium."}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                    <div className="text-xs text-slate-500">
                      Créé le {formatDate(department.createdAt)}
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition-transform duration-300 group-hover:translate-x-1">
                      Entrer
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {isCreateDepartmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.18)]">
            <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                Nouveau département
              </div>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Ajouter un département
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Crée un nouvel espace documentaire métier qui pourra ensuite contenir ses catégories et ses documents.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Nom du département
                  </label>
                  <input
                    value={departmentForm.name}
                    onChange={(e) =>
                      setDepartmentForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Ex. Direction Générale"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Description
                  </label>
                  <textarea
                    value={departmentForm.description ?? ""}
                    onChange={(e) =>
                      setDepartmentForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Décris le rôle documentaire et métier de ce département."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Département actif</div>
                      <div className="mt-1 text-sm text-slate-600">
                        Active immédiatement ce département après sa création.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setDepartmentForm((prev) => ({ ...prev, active: !prev.active }))
                      }
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        departmentForm.active ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          departmentForm.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateDepartmentOpen(false);
                    resetDepartmentForm();
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:text-slate-900"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  disabled={isCreatingDepartment}
                  onClick={handleCreateDepartment}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  {isCreatingDepartment ? "Création..." : "Créer le département"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}