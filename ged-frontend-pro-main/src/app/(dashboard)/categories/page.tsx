"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  FileText,
  Filter,
  Layers3,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";

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

import { useDepartments } from "@/shared/api/hooks/useDepartments";
import { useCategories } from "@/shared/api/hooks/useCategories";
import {
  createCategory,
  deleteCategory,
  fetchCategoryById,
  updateCategory,
  type Category,
  type CategoryRequest,
} from "@/shared/api/resources/category";

import { CategoriesHeader } from "@/features/categories/components/CategoriesHeader";
import { CategoriesToolbar } from "@/features/categories/components/CategoriesToolbar";
import { CategoriesTable } from "@/features/categories/components/CategoriesTable";
import { CategoryDetailsCard } from "@/features/categories/components/CategoryDetailsCard";
import { CategoryFormDialog } from "@/features/categories/components/CategoryFormDialog";
import type { CategoryActiveFilter } from "@/features/categories/types";

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

function buildDepartmentDocumentsHref(departmentId: number) {
  return `/documents?departmentId=${departmentId}`;
}

function buildCategoryDocumentsHref(departmentId: number, categoryId: number) {
  return `/documents?departmentId=${departmentId}&categoryId=${categoryId}`;
}

export default function CategoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const departmentIdFromUrl = searchParams.get("departmentId");
  const parsedDepartmentId = departmentIdFromUrl ? Number(departmentIdFromUrl) : undefined;
  const isDepartmentFocused = !!parsedDepartmentId;

  const { data: departments = [] } = useDepartments();

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);

  const { data: categories = [], isLoading } = useCategories({
    departmentId: selectedDepartmentId,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<CategoryActiveFilter>("all");

  const [selected, setSelected] = useState<Category | null>(null);
  const [editing, setEditing] = useState<Category | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (parsedDepartmentId) {
      setSelectedDepartmentId(parsedDepartmentId);
      return;
    }

    if (!selectedDepartmentId && departments.length > 0) {
      setSelectedDepartmentId(departments[0].id);
    }
  }, [departments, parsedDepartmentId, selectedDepartmentId]);

  const selectedDepartment = useMemo(
    () => departments.find((d) => d.id === selectedDepartmentId) ?? null,
    [departments, selectedDepartmentId]
  );

  const filtered = useMemo(() => {
    let result = categories;

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q) ||
          (c.departmentName ?? "").toLowerCase().includes(q)
      );
    }

    if (activeFilter === "active") {
      result = result.filter((c) => c.active);
    } else if (activeFilter === "inactive") {
      result = result.filter((c) => !c.active);
    }

    return result;
  }, [categories, search, activeFilter]);

  const activeCount = useMemo(() => categories.filter((c) => c.active).length, [categories]);
  const inactiveCount = useMemo(() => categories.filter((c) => !c.active).length, [categories]);

  const handleReset = () => {
    setSearchInput("");
    setSearch("");
    setActiveFilter("all");
  };

  const handleView = async (item: Category) => {
    try {
      const fresh = await fetchCategoryById(item.id);
      setSelected(fresh);
    } catch (e) {
      toast.error("Erreur", { description: e instanceof Error ? e.message : String(e) });
      setSelected(item);
    }
  };

  const resolvePayloadWithDepartment = (payload: CategoryRequest): CategoryRequest => {
    return {
      ...payload,
      departmentId: payload.departmentId ?? selectedDepartmentId ?? null,
    };
  };

  const handleCreate = async (payload: CategoryRequest) => {
    const finalPayload = resolvePayloadWithDepartment(payload);

    if (!finalPayload.departmentId) {
      toast.error("Département requis", {
        description: "Sélectionne d’abord un département avant de créer une catégorie.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const created = await createCategory(finalPayload);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({ queryKey: ["departments"] }),
      ]);
      toast.success("Catégorie créée", {
        description: "La nouvelle catégorie a bien été rattachée au département sélectionné.",
      });
      setIsCreateOpen(false);
      setSelected(created);
    } catch (e) {
      toast.error("Erreur", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (payload: CategoryRequest) => {
    if (!editing) return;

    const finalPayload = resolvePayloadWithDepartment(payload);

    if (!finalPayload.departmentId) {
      toast.error("Département requis", {
        description: "Le département de cette catégorie doit être défini.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateCategory(editing.id, finalPayload);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({ queryKey: ["departments"] }),
      ]);
      toast.success("Catégorie mise à jour");
      setEditing(undefined);
      setSelected(updated);
    } catch (e) {
      toast.error("Erreur", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item: Category) => {
    setIsSaving(true);
    try {
      const updated = await updateCategory(item.id, {
        name: item.name,
        description: item.description ?? null,
        active: !item.active,
        departmentId: item.departmentId ?? selectedDepartmentId ?? null,
      });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(updated.active ? "Catégorie activée" : "Catégorie désactivée");
      setSelected((prev) => (prev?.id === updated.id ? updated : prev));
    } catch (e) {
      toast.error("Erreur", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsSaving(true);
    try {
      await deleteCategory(deleting.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({ queryKey: ["documents"] }),
      ]);
      toast.success("Catégorie supprimée");
      setDeleting(null);
      setEditing(undefined);
      setIsCreateOpen(false);
      setSelected((prev) => (prev?.id === deleting.id ? null : prev));
    } catch (e) {
      toast.error("Erreur", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_30%)]" />

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
                href={buildDepartmentDocumentsHref(selectedDepartment.id)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
              >
                <FileText className="h-4 w-4" />
                Documents du département
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                <Layers3 className="h-3.5 w-3.5 text-violet-600" />
                {isDepartmentFocused ? "Catégories du département" : "Catégorisation contextuelle"}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {isDepartmentFocused && selectedDepartment
                  ? `Catégories du département ${selectedDepartment.name}`
                  : "Catégories alignées sur les départements"}
              </h1>

              <p className="max-w-4xl text-sm leading-7 text-slate-600">
                {isDepartmentFocused && selectedDepartment
                  ? `Cette vue est focalisée sur ${selectedDepartment.name}. Toutes les catégories visibles ici appartiennent uniquement à ce département, et toute nouvelle création y sera automatiquement rattachée.`
                  : "Les catégories ne sont plus isolées. Elles vivent dans un département précis, ce qui améliore la logique de rangement, la navigation et la précision de recherche."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Total visibles</div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">{categories.length}</div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Actives</div>
                <div className="mt-2 text-3xl font-semibold text-emerald-600">{activeCount}</div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Inactives</div>
                <div className="mt-2 text-3xl font-semibold text-amber-600">{inactiveCount}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              Département maître
            </div>
            <div className="text-sm text-slate-600">
              {isDepartmentFocused
                ? "Cette page est verrouillée sur le département depuis lequel tu es arrivé."
                : "Choisis un département pour piloter les catégories dans son propre contexte."}
            </div>
          </div>

          <div className="flex min-w-[280px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Building2 className="h-4 w-4 text-slate-500" />
            <select
              value={selectedDepartmentId ?? ""}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : undefined;
                setSelectedDepartmentId(value);
                setSelected(null);

                if (value) {
                  router.replace(`/categories?departmentId=${value}`);
                } else {
                  router.replace(`/categories`);
                }
              }}
              disabled={isDepartmentFocused}
              className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option value="">Sélectionner un département</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedDepartment && (
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-violet-50 px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">{selectedDepartment.name}</span>
            <span className="mx-2 text-slate-400">•</span>
            <span>
              {isDepartmentFocused
                ? "Tu es dans une vue spécialisée liée directement à ce département."
                : "Les créations et modifications seront rattachées à ce département."}
            </span>
            {selectedDepartment.createdAt && (
              <>
                <span className="mx-2 text-slate-400">•</span>
                <span>Créé le {formatDate(selectedDepartment.createdAt)}</span>
              </>
            )}
          </div>
        )}
      </div>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm xl:col-span-2">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Contexte actif
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedDepartment
                  ? `Toutes les catégories visibles ici appartiennent à ${selectedDepartment.name}.`
                  : "Sélectionne un département pour afficher exclusivement ses catégories."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Action rapide
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Toute nouvelle catégorie créée ici sera automatiquement rattachée au département actif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {selectedDepartment && (
        <section className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                <FileText className="h-3.5 w-3.5 text-slate-600" />
                Accès documentaire
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Aller vers les documents depuis les catégories
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">
                Depuis cette page, tu peux ouvrir tous les documents du département ou aller
                directement vers les documents filtrés par catégorie.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={buildDepartmentDocumentsHref(selectedDepartment.id)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <FileText className="h-4 w-4" />
                Voir tous les documents du département
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.length > 0 ? (
              filtered.map((category) => (
                <div
                  key={category.id}
                  className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{category.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {category.active ? "Catégorie active" : "Catégorie inactive"}
                      </div>
                    </div>

                    <div
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        category.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {category.active ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-3 min-h-[60px] text-sm leading-6 text-slate-600">
                    {category.description?.trim()
                      ? category.description
                      : "Aucune description renseignée pour cette catégorie."}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                    <div className="text-xs text-slate-500">Créée le {formatDate(category.createdAt)}</div>

                    <Link
                      href={buildCategoryDocumentsHref(selectedDepartment.id, category.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
                    >
                      Voir les documents
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
                <div className="text-lg font-semibold text-slate-900">
                  Aucune catégorie visible
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Aucune catégorie ne correspond aux filtres actuels. Tu peux réinitialiser ou accéder
                  directement à tous les documents du département.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Réinitialiser
                  </button>

                  <Link
                    href={buildDepartmentDocumentsHref(selectedDepartment.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    <FileText className="h-4 w-4" />
                    Voir les documents du département
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <CategoriesHeader
        total={categories.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        onNew={() => {
          if (!selectedDepartmentId) {
            toast.error("Département requis", {
              description: "Sélectionne un département avant de créer une catégorie.",
            });
            return;
          }
          setEditing(undefined);
          setIsCreateOpen(true);
        }}
      />

      <CategoriesToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearchApply={() => setSearch(searchInput)}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        onReset={handleReset}
        total={filtered.length}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_420px]">
        <div className="rounded-[24px] border border-white/70 bg-white/80 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <CategoriesTable
            items={filtered}
            isLoading={isLoading || isSaving}
            onView={handleView}
            onEdit={(item) => {
              setEditing(item);
              setIsCreateOpen(false);
              if (item.departmentId) {
                setSelectedDepartmentId(item.departmentId);
              }
            }}
            onToggleActive={handleToggleActive}
            onDelete={(item) => setDeleting(item)}
          />
        </div>

        <div className="space-y-6">
          <CategoryDetailsCard item={selected} />

          <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Recommandation structurelle
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Pour une GED professionnelle, chaque catégorie doit rester attachée à un seul département.
                  Cela rend la recherche plus claire et évite les mélanges documentaires.
                </p>
              </div>
            </div>

            {selectedDepartment && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Département courant
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {selectedDepartment.name}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Les opérations de cette page restent concentrées sur ce département.
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/departments?departmentId=${selectedDepartment.id}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Revenir au département
                  </Link>

                  <Link
                    href={buildDepartmentDocumentsHref(selectedDepartment.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    Voir les documents
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {selected && selected.id && (
                  <div className="mt-3">
                    <Link
                      href={buildCategoryDocumentsHref(selectedDepartment.id, selected.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-slate-900"
                    >
                      Documents de la catégorie sélectionnée
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CategoryFormDialog
        open={isCreateOpen || !!editing}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditing(undefined);
          }
        }}
        category={editing}
        onSubmit={editing ? handleUpdate : handleCreate}
        isLoading={isSaving}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent aria-describedby="alert-dialog-description">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription id="alert-dialog-description">
              Cette action est irréversible. La catégorie sera définitivement supprimée.
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