"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import type { Category, CategoryRequest } from "@/shared/api/resources/category";
import { categoryFormSchema, type CategoryFormValues } from "@/features/categories/types";

const CATEGORY_TEMPLATES = [
  { name: "Courrier entrant", description: "Documents reçus officiellement par la structure." },
  { name: "Courrier sortant", description: "Documents émis officiellement vers des tiers." },
  { name: "Décision", description: "Décisions administratives et validations internes." },
  { name: "Note de service", description: "Notes internes, instructions et communications." },
  { name: "Rapport", description: "Rapports d’activité, synthèse et reporting." },
  { name: "Contrat", description: "Contrats, conventions et engagements juridiques." },
  { name: "Dossier boursier", description: "Pièces et documents liés aux bourses et bénéficiaires." },
  { name: "Pièce justificative", description: "Annexes, preuves et justificatifs administratifs." },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSubmit: (payload: CategoryRequest) => Promise<void>;
  isLoading?: boolean;
};

export function CategoryFormDialog({ open, onOpenChange, category, onSubmit, isLoading }: Props) {
  const isEdit = !!category;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (category) {
      form.reset({
        name: category.name,
        description: category.description ?? "",
        active: category.active,
      });
      return;
    }

    form.reset({
      name: "",
      description: "",
      active: true,
    });
  }, [open, category, form]);

  const handleSubmit = async (values: CategoryFormValues) => {
    const payload: CategoryRequest = {
      name: values.name.trim(),
      description: values.description?.trim() ? values.description.trim() : null,
      active: !!values.active,
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>{isEdit ? "Modifier la catégorie" : "Créer une catégorie"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations de la catégorie."
              : "Renseignez les informations pour créer une nouvelle catégorie."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4 pb-6">
            {!isEdit ? (
              <div className="space-y-2">
                <div className="text-sm font-semibold">Modèles rapides</div>
                <div className="text-xs text-muted-foreground">
                  Sélectionnez un modèle pour pré-remplir le nom et la description.
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_TEMPLATES.map((t) => (
                    <Button
                      key={t.name}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue("name", t.name, { shouldDirty: true });
                        form.setValue("description", t.description, { shouldDirty: true });
                        form.setValue("active", true, { shouldDirty: true });
                      }}
                    >
                      {t.name}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Courrier entrant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description courte et professionnelle…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <input
                      id="category-active"
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormLabel htmlFor="category-active" className="!mt-0 text-sm font-normal cursor-pointer">
                    Catégorie active
                  </FormLabel>
                </FormItem>
              )}
            />

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
      </DialogContent>
    </Dialog>
  );
}
