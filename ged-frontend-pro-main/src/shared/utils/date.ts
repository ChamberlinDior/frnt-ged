import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(
  date: string | Date,
  pattern: string = "dd MMM yyyy"
): string {
  return format(new Date(date), pattern, { locale: fr });
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);

  if (isToday(d)) {
    return "Aujourd'hui";
  }

  if (isYesterday(d)) {
    return "Hier";
  }

  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy à HH:mm", { locale: fr });
}
