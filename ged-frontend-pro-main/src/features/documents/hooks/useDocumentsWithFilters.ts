"use client";

import { useMemo, useState } from "react";
import { useDocuments } from "@/shared/api/hooks/useDocuments";
import type { DocumentItem } from "@/shared/api/resources/document";
import type { DocumentFilters } from "@/features/documents/types";

function includesInsensitive(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function useDocumentsWithFilters(initial: Partial<DocumentFilters> = {}) {
  const { data: allDocuments = [], isLoading, error } = useDocuments();

  const [filters, setFilters] = useState<DocumentFilters>({
    page: 1,
    limit: 10,
    sortBy: "date",
    sortOrder: "desc",
    status: "all",
    ...initial,
  });

  const filtered = useMemo(() => {
    let result: DocumentItem[] = allDocuments;

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      result = result.filter(
        (d) =>
          includesInsensitive(d.title, q) || includesInsensitive(d.referenceCode ?? "", q)
      );
    }

    if (filters.status && filters.status !== "all") {
      result = result.filter((d) => d.status === filters.status);
    }

    if (typeof filters.active === "boolean") {
      result = result.filter((d) => d.active === filters.active);
    }

    if (filters.categoryId) {
      result = result.filter((d) => d.categoryId === filters.categoryId);
    }

    if (filters.departmentId) {
      result = result.filter((d) => d.departmentId === filters.departmentId);
    }

    const sortBy = filters.sortBy ?? "date";
    const sortOrder = filters.sortOrder ?? "desc";

    result = result.slice().sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "title") {
        return order * a.title.localeCompare(b.title);
      }
      if (sortBy === "status") {
        return order * a.status.localeCompare(b.status);
      }

      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return order * (aTime - bTime);
    });

    const total = result.length;
    const limit = filters.limit ?? 10;
    const page = filters.page ?? 1;
    const start = (page - 1) * limit;
    const paged = result.slice(start, start + limit);

    return { documents: paged, total };
  }, [allDocuments, filters]);

  const updateFilter = <K extends keyof DocumentFilters>(key: K, value: DocumentFilters[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? (value as number) : 1,
    }));
  };

  return {
    documents: filtered.documents,
    total: filtered.total,
    isLoading,
    error,
    filters,
    setFilters,
    updateFilter,
  };
}
