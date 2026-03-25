"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocuments } from "@/shared/api/hooks/useDocuments";
import { formatRelativeDate } from "@/shared/utils/date";
import { AlertCircle, CheckCircle, Clock, FileUp, RefreshCw, Share2 } from "lucide-react";

type ActivityType = "upload" | "approve" | "update" | "share";

const activityIcons = {
  upload: FileUp,
  approve: CheckCircle,
  update: RefreshCw,
  share: Share2,
} satisfies Record<ActivityType, React.ComponentType<{ className?: string }>>;

const activityColors = {
  upload: "text-blue-600 bg-blue-100",
  approve: "text-emerald-600 bg-emerald-100",
  update: "text-amber-600 bg-amber-100",
  share: "text-purple-600 bg-purple-100",
} satisfies Record<ActivityType, string>;

function getActivityType(status: string, index: number): ActivityType {
  if (status === "VALIDATED") return "approve";
  if (status === "ARCHIVED") return "share";
  return index % 2 === 0 ? "upload" : "update";
}

function getActivityDescription(type: ActivityType) {
  switch (type) {
    case "upload":
      return "Document ajouté";
    case "approve":
      return "Document validé";
    case "update":
      return "Mise à jour";
    case "share":
      return "Partagé / archivé";
  }
}

export function RecentActivity() {
  const { data: docs = [], isLoading } = useDocuments();

  if (isLoading) {
    return (
      <Card className="shadow-sm border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Activité récente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const recent = [...docs]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 4);

  if (docs.length === 0) {
    return (
      <Card className="shadow-sm border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-3 rounded-full bg-muted mb-4">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-2">Aucune activité récente</p>
            <p className="text-xs text-muted-foreground max-w-[260px]">
              Les activités apparaîtront ici lorsque vous commencerez à créer et gérer des documents.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activities = recent.map((doc, index) => {
    const type = getActivityType(doc.status, index);
    const Icon = activityIcons[type];
    const iconColor = activityColors[type];

    return {
      id: doc.id,
      type,
      Icon,
      iconColor,
      title: doc.title,
      description: getActivityDescription(type),
      time: doc.createdAt ? formatRelativeDate(doc.createdAt) : "—",
    };
  });

  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`p-2 rounded-full ${activity.iconColor}`}>
                <activity.Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate" title={activity.title}>
                    {activity.title}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">Aucune activité récente</div>
        )}
      </CardContent>
    </Card>
  );
}
