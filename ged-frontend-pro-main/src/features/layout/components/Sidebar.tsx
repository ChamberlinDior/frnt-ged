"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Building2,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Tag,
} from "lucide-react";
import { useDepartments } from "@/shared/api/hooks/useDepartments";
import { useCategories } from "@/shared/api/hooks/useCategories";

const navigation = [
  {
    href: "/",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    description: "Vue d'ensemble et suivi métier",
  },
  {
    href: "/departments",
    label: "Départements",
    icon: Building2,
    description: "Espaces documentaires métiers",
  },
] as const;

const secondaryNavigation = [
  { href: "/help", label: "Aide", icon: HelpCircle },
] as const;

const navIconClassByHref: Record<string, string> = {
  "/": "text-sky-600",
  "/departments": "text-amber-600",
  "/help": "text-violet-600",
};

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentDepartmentId = searchParams.get("departmentId");
  const parsedDepartmentId = currentDepartmentId ? Number(currentDepartmentId) : undefined;

  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
  const { data: scopedCategories = [], isLoading: categoriesLoading } = useCategories({
    departmentId: parsedDepartmentId,
  });

  const [departmentsOpen, setDepartmentsOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  const selectedDepartment = useMemo(() => {
    if (!parsedDepartmentId) return null;
    return departments.find((item) => item.id === parsedDepartmentId) ?? null;
  }, [departments, parsedDepartmentId]);

  const activeTopLevel = useMemo(() => {
    return navigation.find((item) => isRouteActive(pathname, item.href))?.href ?? null;
  }, [pathname]);

  const showDepartmentTree = true;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-white h-screen">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-600">Navigation</div>
            {selectedDepartment ? (
              <div className="truncate text-xs text-slate-400">{selectedDepartment.name}</div>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = activeTopLevel === item.href;
          const iconClass = navIconClassByHref[item.href] ?? "text-muted-foreground";

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "relative w-full justify-start gap-3 h-auto py-3",
                  active && "bg-blue-50 text-blue-700 hover:bg-blue-100"
                )}
              >
                <span
                  className={cn(
                    "absolute left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-transparent",
                    active && "bg-blue-600"
                  )}
                />
                <Icon className={cn("h-4 w-4", iconClass)} />
                <div className="text-left">
                  <div className="text-sm font-medium">{item.label}</div>
                  {"description" in item && item.description ? (
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  ) : null}
                </div>
              </Button>
            </Link>
          );
        })}

        {showDepartmentTree && (
          <>
            <Separator className="my-4" />

            <button
              type="button"
              onClick={() => setDepartmentsOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-600" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Départements</div>
                  <div className="text-xs text-muted-foreground">
                    Liste des départements existants
                  </div>
                </div>
              </div>

              {departmentsOpen ? (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {departmentsOpen && (
              <div className="space-y-1 pl-2">
                {departmentsLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-10 animate-pulse rounded-lg bg-slate-100"
                    />
                  ))
                ) : departments.length > 0 ? (
                  departments.map((department) => {
                    const active = department.id === parsedDepartmentId;

                    return (
                      <div key={department.id} className="space-y-1">
                        <Link href={`/departments?departmentId=${department.id}`}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "relative w-full justify-start gap-3 h-auto py-3",
                              active && "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-transparent",
                                active && "bg-blue-600"
                              )}
                            />
                            <Building2 className="h-4 w-4 text-amber-600" />
                            <div className="text-left min-w-0">
                              <div className="truncate text-sm font-medium">
                                {department.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {department.active ? "Département actif" : "Département inactif"}
                              </div>
                            </div>
                          </Button>
                        </Link>

                        {active && (
                          <div className="ml-4 space-y-1">
                            <button
                              type="button"
                              onClick={() => setCategoriesOpen((prev) => !prev)}
                              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                            >
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-emerald-600" />
                                <span className="text-xs font-medium text-slate-600">
                                  Catégories du département
                                </span>
                              </div>

                              {categoriesOpen ? (
                                <ChevronDown className="h-4 w-4 text-slate-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-slate-500" />
                              )}
                            </button>

                            {categoriesOpen && (
                              <div className="space-y-1">
                                <Link href={`/categories?departmentId=${department.id}`}>
                                  <Button
                                    variant="ghost"
                                    className={cn(
                                      "w-full justify-start gap-3 text-muted-foreground",
                                      pathname === "/categories" &&
                                        active &&
                                        "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    )}
                                  >
                                    <Tag className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm">Gérer les catégories</span>
                                  </Button>
                                </Link>

                                <Link href={`/documents?departmentId=${department.id}`}>
                                  <Button
                                    variant="ghost"
                                    className={cn(
                                      "w-full justify-start gap-3 text-muted-foreground",
                                      pathname === "/documents" &&
                                        active &&
                                        !searchParams.get("categoryId") &&
                                        "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    )}
                                  >
                                    <FolderOpen className="h-4 w-4 text-indigo-600" />
                                    <span className="text-sm">Documents du département</span>
                                  </Button>
                                </Link>

                                {categoriesLoading ? (
                                  Array.from({ length: 3 }).map((_, index) => (
                                    <div
                                      key={index}
                                      className="h-8 animate-pulse rounded-lg bg-slate-100"
                                    />
                                  ))
                                ) : scopedCategories.length > 0 ? (
                                  scopedCategories.map((category) => {
                                    const activeCategoryId = searchParams.get("categoryId");
                                    const categoryActive =
                                      pathname === "/documents" &&
                                      activeCategoryId &&
                                      Number(activeCategoryId) === category.id;

                                    return (
                                      <Link
                                        key={category.id}
                                        href={`/documents?departmentId=${department.id}&categoryId=${category.id}`}
                                      >
                                        <Button
                                          variant="ghost"
                                          className={cn(
                                            "w-full justify-start gap-3 text-muted-foreground",
                                            categoryActive &&
                                              "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                          )}
                                        >
                                          <Tag className="h-4 w-4 text-emerald-600" />
                                          <span className="truncate text-sm">{category.name}</span>
                                        </Button>
                                      </Link>
                                    );
                                  })
                                ) : (
                                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                                    Aucune catégorie pour ce département.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    Aucun département disponible.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <Separator className="my-4" />

        {secondaryNavigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const iconClass = navIconClassByHref[item.href] ?? "text-muted-foreground";

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "relative w-full justify-start gap-3 text-muted-foreground",
                  active && "bg-blue-50 text-blue-700 hover:bg-blue-100"
                )}
              >
                <span
                  className={cn(
                    "absolute left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-transparent",
                    active && "bg-blue-600"
                  )}
                />
                <Icon className={cn("h-4 w-4", iconClass)} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="text-xs text-slate-400 text-center">v1.0.0 - GED Pro</div>
      </div>
    </aside>
  );
}