"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function DashboardSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/documents?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un document (titre, référence)…"
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-10 px-6 font-medium" disabled={!searchQuery.trim()}>
            Rechercher
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 ml-1">
          Recherche rapide dans tous les documents
        </p>
      </CardContent>
    </Card>
  );
}
