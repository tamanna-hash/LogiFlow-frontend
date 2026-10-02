"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { FormField } from "@/components/shared/FormField";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { usePricingRules, useCreatePricingRule, useUpdatePricingRule, useDeletePricingRule } from "@/features/pricing/hooks";
import { formatCurrency } from "@/lib/utils";
import type { PricingRule } from "@/types";

const ruleSchema = z.object({
  name:                  z.string().min(2, "Name is required"),
  basePrice:             z.coerce.number().min(0),
  pricePerKg:            z.coerce.number().min(0),
  baseWeightKg:          z.coerce.number().min(0).default(1),
  zoneSurcharge:         z.coerce.number().min(0).default(0),
  deliveryTypeSurcharge: z.coerce.number().min(0).default(0),
  deliveryType:          z.enum(["STANDARD","EXPRESS","SAME_DAY",""]).optional(),
  parcelType:            z.enum(["DOCUMENT","REGULAR","FRAGILE","OVERSIZED",""]).optional(),
  isDefault:             z.boolean().default(false),
});
type RuleFormValues = z.infer<typeof ruleSchema>;

function RuleDialog({
  open,
  onOpenChange,
  rule,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rule?: PricingRule | null;
}) {
  const { mutate: create, isPending: isCreating } = useCreatePricingRule();
  const { mutate: update, isPending: isUpdating } = useUpdatePricingRule();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: rule ? {
      name: rule.name,
      basePrice: rule.basePrice,
      pricePerKg: rule.pricePerKg,
      baseWeightKg: rule.baseWeightKg,
      zoneSurcharge: rule.zoneSurcharge,
      deliveryTypeSurcharge: rule.deliveryTypeSurcharge,
      deliveryType: (rule.deliveryType ?? "") as RuleFormValues["deliveryType"],
      parcelType: (rule.parcelType ?? "") as RuleFormValues["parcelType"],
      isDefault: rule.isDefault,
    } : { baseWeightKg: 1, zoneSurcharge: 0, deliveryTypeSurcharge: 0, isDefault: false },
  });

  if (!open) return null;

  function onSubmit(vals: RuleFormValues) {
    const payload = {
      ...vals,
      deliveryType: vals.deliveryType || undefined,
      parcelType: vals.parcelType || undefined,
    };
    if (rule) {
      update({ id: rule.id, data: payload }, { onSuccess: () => { onOpenChange(false); reset(); } });
    } else {
      create(payload, { onSuccess: () => { onOpenChange(false); reset(); } });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="w-full max-w-lg my-4">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">{rule ? "Edit pricing rule" : "New pricing rule"}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
              <Input id="name" {...register("name")} placeholder="Standard rate" />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Base price (BDT)" htmlFor="basePrice" error={errors.basePrice?.message} required>
                <Input id="basePrice" type="number" step="0.01" {...register("basePrice")} />
              </FormField>
              <FormField label="Price per kg (BDT)" htmlFor="pricePerKg" error={errors.pricePerKg?.message} required>
                <Input id="pricePerKg" type="number" step="0.01" {...register("pricePerKg")} />
              </FormField>
              <FormField label="Base weight (kg)" htmlFor="baseWeightKg" error={errors.baseWeightKg?.message}>
                <Input id="baseWeightKg" type="number" step="0.1" {...register("baseWeightKg")} />
              </FormField>
              <FormField label="Zone surcharge (BDT)" htmlFor="zoneSurcharge" error={errors.zoneSurcharge?.message}>
                <Input id="zoneSurcharge" type="number" step="0.01" {...register("zoneSurcharge")} />
              </FormField>
              <FormField label="Delivery type surcharge" htmlFor="deliveryTypeSurcharge">
                <Input id="deliveryTypeSurcharge" type="number" step="0.01" {...register("deliveryTypeSurcharge")} />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Delivery type (optional)" htmlFor="deliveryType">
                <Controller control={control} name="deliveryType" render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger id="deliveryType"><SelectValue placeholder="All types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="EXPRESS">Express</SelectItem>
                      <SelectItem value="SAME_DAY">Same Day</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
              <FormField label="Parcel type (optional)" htmlFor="parcelType">
                <Controller control={control} name="parcelType" render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger id="parcelType"><SelectValue placeholder="All types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="DOCUMENT">Document</SelectItem>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="FRAGILE">Fragile</SelectItem>
                      <SelectItem value="OVERSIZED">Oversized</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register("isDefault")} className="rounded" />
              Set as default rule
            </label>
          </div>
          <div className="p-6 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={isCreating || isUpdating}>{rule ? "Save changes" : "Create rule"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function AdminPricingPage() {
  const { data: rules, isLoading, isError, refetch } = usePricingRules();
  const { mutate: deleteRule, isPending: isDeleting } = useDeletePricingRule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState<PricingRule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteName = rules?.find(r => r.id === deleteId)?.name ?? "";

  return (
    <div className="space-y-6">
      <PageHeader title="Pricing Rules" description="Manage delivery pricing rules.">
        <Button onClick={() => { setEditRule(null); setDialogOpen(true); }}>
          <Plus className="mr-2 size-4" />
          New rule
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6"><ErrorState title="Could not load pricing rules" onRetry={() => refetch()} /></div>
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : !rules || rules.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<Settings className="size-6" />} title="No pricing rules" description="Create a pricing rule to start calculating delivery charges." action={{ label: "Create rule", onClick: () => setDialogOpen(true) }} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Base</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Per kg</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Applies to</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{rule.name}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(rule.basePrice)}</td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">{formatCurrency(rule.pricePerKg)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                        {rule.deliveryType ?? "All"} · {rule.parcelType ?? "All"}
                      </td>
                      <td className="px-4 py-3">
                        {rule.isDefault && <Badge variant="secondary">Default</Badge>}
                        {!rule.isActive && <Badge variant="destructive">Inactive</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditRule(rule); setDialogOpen(true); }} aria-label="Edit rule">
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(rule.id)} aria-label="Delete rule">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <RuleDialog open={dialogOpen} onOpenChange={setDialogOpen} rule={editRule} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => { if (!v) setDeleteId(null); }}
        title="Delete pricing rule"
        description={`Delete "${deleteName}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteRule(deleteId!, { onSuccess: () => setDeleteId(null) })}
        loading={isDeleting}
      />
    </div>
  );
}
