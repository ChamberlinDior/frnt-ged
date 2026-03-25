"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Layers3,
  ShieldCheck,
  Sparkles,
  Archive,
  ChevronRight,
} from "lucide-react";

import { useDepartments } from "@/shared/api/hooks/useDepartments";
import { useCategories } from "@/shared/api/hooks/useCategories";
import { useDocuments } from "@/shared/api/hooks/useDocuments";

import { RecentDocuments } from "@/features/dashboard/components/RecentDocuments";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { QuickStats } from "@/features/dashboard/components/QuickStats";
import { DashboardMetrics } from "@/features/dashboard/components/DashboardMetrics";
import { DashboardSearch } from "@/features/dashboard/components/DashboardSearch";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { ComplianceProgress } from "@/features/dashboard/components/ComplianceProgress";

const structureCards = [
  {
    icon: Layers3,
    title: "Catégorisation contextuelle",
    text: "Chaque catégorie appartient à un département précis afin de garantir une lecture plus cohérente et une meilleure organisation documentaire.",
  },
  {
    icon: FolderKanban,
    title: "Classement documentaire",
    text: "Les documents sont structurés dans leur espace métier naturel pour renforcer la lisibilité, le filtrage et la traçabilité.",
  },
  {
    icon: ShieldCheck,
    title: "Cohérence & conformité",
    text: "La structure départementale réduit les incohérences, facilite le contrôle et améliore la qualité globale de l’archivage.",
  },
];

function formatDate(date?: string | null) {
  if (!date) return "Date indisponible";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date indisponible";
  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const toastShownRef = useRef(false);

  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
  const { data: categories = [] } = useCategories();
  const { data: documents = [] } = useDocuments();

  useEffect(() => {
    if (toastShownRef.current) return;
    toastShownRef.current = true;

    toast.success("Dashboard chargé", {
      description: `${new Date().toLocaleDateString("fr-FR")} • Vue synchronisée`,
      duration: 2500,
    });
  }, []);

  const activeDepartments = useMemo(
    () => departments.filter((d) => d.active).length,
    [departments]
  );

  const activeCategories = useMemo(
    () => categories.filter((c) => c.active).length,
    [categories]
  );

  const activeDocuments = useMemo(
    () => documents.filter((d) => d.active).length,
    [documents]
  );

  const departmentCards = useMemo(() => {
    return departments.map((department) => {
      const departmentCategories = categories.filter(
        (category) => category.departmentId === department.id
      );
      const departmentDocuments = documents.filter(
        (document) => document.departmentId === department.id
      );
      const activeDepartmentDocuments = departmentDocuments.filter((document) => document.active);

      return {
        ...department,
        categoryCount: departmentCategories.length,
        documentCount: departmentDocuments.length,
        activeDocumentCount: activeDepartmentDocuments.length,
      };
    });
  }, [departments, categories, documents]);

  return (
    <div className="space-y-8 p-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                <Sparkles className="h-3.5 w-3.5 text-slate-600" />
                Tableau de bord GED
              </div>

              <div className="space-y-3">
                <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                  Accès structuré aux départements documentaires
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  Chaque département devient ici un point d’entrée clair et professionnel
                  vers ses catégories et ses documents. L’objectif est de privilégier une
                  navigation sobre, logique et durable.
                </p>
              </div>
            </div>

            <div className="grid min-w-[320px] gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Départements actifs
                </div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">
                  {activeDepartments}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Catégories actives
                </div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">
                  {activeCategories}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Documents actifs
                </div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">
                  {activeDocuments}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DashboardMetrics />
      <DashboardSearch />

      <section className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              <Building2 className="h-3.5 w-3.5 text-slate-600" />
              Départements
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Espaces documentaires disponibles
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              Sélectionne un département pour accéder directement à son univers documentaire,
              à ses catégories et à ses documents associés.
            </p>
          </div>

          <Link
            href="/departments"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900"
          >
            Voir tous les départements
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {departmentsLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[220px] animate-pulse rounded-[24px] border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : departmentCards.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {departmentCards.map((department) => (
              <Link
                key={department.id}
                href={`/departments?departmentId=${department.id}`}
                className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_45px_rgba(15,23,42,0.08)]"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                        <Building2 className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Département
                        </div>
                        <h3 className="mt-1 line-clamp-2 text-xl font-semibold tracking-tight text-slate-900">
                          {department.name}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        department.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {department.active ? "Actif" : "Inactif"}
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 min-h-[64px] text-sm leading-6 text-slate-600">
                    {department.description?.trim()
                      ? department.description
                      : "Département structuré pour accueillir ses catégories et ses documents dans une logique métier claire."}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Catégories
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">
                        {department.categoryCount}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Documents
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">
                        {department.documentCount}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Actifs
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">
                        {department.activeDocumentCount}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      Créé le {formatDate(department.createdAt)}
                    </div>

                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition-transform duration-200 group-hover:translate-x-0.5">
                      Ouvrir
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 text-slate-500">
              <Archive className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">
              Aucun département créé pour le moment
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Dès qu’un département sera créé, il apparaîtra ici avec ses indicateurs
              et son accès direct.
            </p>
            <div className="mt-6">
              <Link
                href="/departments"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800"
              >
                Aller créer un département
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-slate-600" />
            Organisation documentaire
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Principes de structuration
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {structureCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
              >
                <div className="space-y-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <ComplianceProgress />
          <RecentActivity />
        </div>

        <div className="space-y-8">
          <QuickActions />
          <RecentDocuments />
        </div>
      </div>

      <QuickStats />
    </div>
  );
}