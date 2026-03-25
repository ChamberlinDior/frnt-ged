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

import type { Department, DepartmentRequest } from "@/shared/api/resources/department";
import { departmentFormSchema, type DepartmentFormValues } from "@/features/departments/types";

const DEPARTMENT_TEMPLATES = [
  { name: "Direction générale", description: "Coordination stratégique et pilotage de l’organisation." },
  { name: "Ressources humaines", description: "Gestion administrative, recrutement et formation du personnel." },
  { name: "Finance et comptabilité", description: "Suivi budgétaire, comptabilité et gestion financière." },
  { name: "Juridique et conformité", description: "Conseil juridique, gestion contractuelle et conformité réglementaire." },
  { name: "Technologies de l’information", description: "Infrastructures, développement et support des systèmes d’information." },
  { name: "Marketing et communication", description: "Stratégie de communication, promotion et relations publiques." },
  { name: "Logistique et approvisionnement", description: "Gestion des stocks, achats et chaîne logistique." },
  { name: "Opérations et production", description: "Pilotage des activités opérationnelles et production." },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department;
  onSubmit: (payload: DepartmentRequest) => Promise<void>;
  isLoading?: boolean;
};

export function DepartmentFormDialog({ open, onOpenChange, department, onSubmit, isLoading }: Props) {
  const isEdit = !!department;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (department) {
      form.reset({
        name: department.name,
        description: department.description ?? "",
        active: department.active,
      });
      return;
    }

    form.reset({
      name: "",
      description: "",
      active: true,
    });
  }, [open, department, form]);

  const handleSubmit = async (values: DepartmentFormValues) => {
    const payload: DepartmentRequest = {
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
          <DialogTitle>{isEdit ? "Modifier le département" : "Créer un département"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations du département."
              : "Renseignez les informations pour créer un nouveau département."}
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
                  {DEPARTMENT_TEMPLATES.map((t) => (
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
                    <Input placeholder="Ex: Direction générale" {...field} />
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
                      id="department-active"
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormLabel htmlFor="department-active" className="!mt-0 text-sm font-normal cursor-pointer">
                    Département actif
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
