"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Plus, Trash2, Package, Check, Calculator } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCreateShipment, useZones, useCalculatePrice } from "@/features/shipments/hooks";
import { createShipmentSchema, type CreateShipmentFormValues } from "@/lib/validations/shipment";
import { formatCurrency } from "@/lib/utils";
import type { PriceBreakdown } from "@/types";

const STEPS = [
  { id: 1, label: "Sender" },
  { id: 2, label: "Recipient" },
  { id: 3, label: "Parcel" },
  { id: 4, label: "Review" },
];

export function CreateShipmentWizard() {
  const [step, setStep] = useState(1);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const router = useRouter();
  const { mutate: createShipment, isPending } = useCreateShipment();
  const { mutate: calcPrice, isPending: isCalcPending } = useCalculatePrice();
  const { data: zonesData } = useZones({ isActive: true, limit: 100 });
  const zones = zonesData?.zones ?? [];

  // Use unknown to bridge the resolver type mismatch caused by Zod's .default() types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<CreateShipmentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    resolver: zodResolver(createShipmentSchema) as any,
    defaultValues: {
      deliveryType: "STANDARD",
      parcelType: "REGULAR",
      items: [{ description: "", weightKg: 0.5, quantity: 1, parcelType: "REGULAR" as const }],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  async function goNext() {
    const fieldsToValidate: string[] = ({
      1: ["senderName", "senderPhone", "senderAddress", "senderCity", "originZoneId"],
      2: ["recipientName", "recipientPhone", "recipientAddress", "recipientCity", "destinationZoneId"],
      3: ["declaredWeightKg", "deliveryType", "parcelType", "items"],
    } as Record<number, string[]>)[step] ?? [];

    const valid = await trigger(fieldsToValidate as Parameters<typeof trigger>[0]);
    if (!valid) return;

    if (step === 3) {
      // Calculate price before review
      const vals = getValues();
      calcPrice(
        {
          originZoneId: vals.originZoneId,
          destinationZoneId: vals.destinationZoneId,
          deliveryType: vals.deliveryType,
          parcelType: vals.parcelType,
          weightKg: vals.declaredWeightKg,
        },
        {
          onSuccess: (data) => {
            setPriceBreakdown(data);
            setStep(4);
          },
        }
      );
      return;
    }

    setStep((s) => s + 1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onSubmit(values: Record<string, any>) {
    createShipment(values as Record<string, unknown>, {
      onSuccess: (data) => {
        router.push(`/dashboard/customer/shipments/${data.id}`);
      },
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/customer/shipments">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
        <PageHeader title="Create shipment" />
      </div>

      {/* Step indicator */}
      <nav aria-label="Shipment creation steps">
        <ol className="flex items-center gap-1">
          {STEPS.map((s, idx) => (
            <li key={s.id} className="flex items-center gap-1">
              <div
                className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                  step > s.id
                    ? "bg-primary text-primary-foreground"
                    : step === s.id
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
                aria-current={step === s.id ? "step" : undefined}
              >
                {step > s.id ? <Check className="size-3.5" /> : s.id}
              </div>
              <span className={`text-xs hidden sm:block ${step === s.id ? "font-medium" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div className={`h-px flex-1 min-w-4 ${step > s.id ? "bg-primary" : "bg-muted"}`} />
              )}
            </li>
          ))}
        </ol>
      </nav>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Sender */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Sender information</CardTitle>
              <CardDescription>Where is this shipment being sent from?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Sender name" htmlFor="senderName" error={errors.senderName?.message} required className="col-span-2">
                  <Input id="senderName" placeholder="Full name" {...register("senderName")} />
                </FormField>
                <FormField label="Phone" htmlFor="senderPhone" error={errors.senderPhone?.message} required>
                  <Input id="senderPhone" type="tel" placeholder="01700000000" {...register("senderPhone")} />
                </FormField>
                <FormField label="City" htmlFor="senderCity" error={errors.senderCity?.message} required>
                  <Input id="senderCity" placeholder="Dhaka" {...register("senderCity")} />
                </FormField>
              </div>
              <FormField label="Address" htmlFor="senderAddress" error={errors.senderAddress?.message} required>
                <Textarea id="senderAddress" placeholder="Full address" rows={2} {...register("senderAddress")} />
              </FormField>
              <FormField label="Origin zone" htmlFor="originZoneId" error={errors.originZoneId?.message} required>
                <Controller
                  control={control}
                  name="originZoneId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="originZoneId">
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((z) => (
                          <SelectItem key={z.id} value={z.id}>{z.name} ({z.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Recipient */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Recipient information</CardTitle>
              <CardDescription>Where should this shipment be delivered?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Recipient name" htmlFor="recipientName" error={errors.recipientName?.message} required className="col-span-2">
                  <Input id="recipientName" placeholder="Full name" {...register("recipientName")} />
                </FormField>
                <FormField label="Phone" htmlFor="recipientPhone" error={errors.recipientPhone?.message} required>
                  <Input id="recipientPhone" type="tel" placeholder="01700000000" {...register("recipientPhone")} />
                </FormField>
                <FormField label="City" htmlFor="recipientCity" error={errors.recipientCity?.message} required>
                  <Input id="recipientCity" placeholder="Chittagong" {...register("recipientCity")} />
                </FormField>
              </div>
              <FormField label="Address" htmlFor="recipientAddress" error={errors.recipientAddress?.message} required>
                <Textarea id="recipientAddress" placeholder="Full address" rows={2} {...register("recipientAddress")} />
              </FormField>
              <FormField label="Destination zone" htmlFor="destinationZoneId" error={errors.destinationZoneId?.message} required>
                <Controller
                  control={control}
                  name="destinationZoneId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="destinationZoneId">
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((z) => (
                          <SelectItem key={z.id} value={z.id}>{z.name} ({z.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Parcel */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Parcel details</CardTitle>
              <CardDescription>Describe what you&apos;re sending.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Total weight (kg)" htmlFor="declaredWeightKg" error={errors.declaredWeightKg?.message} required>
                  <Input
                    id="declaredWeightKg"
                    type="number"
                    step="0.1"
                    min="0.1"
                    {...register("declaredWeightKg", { valueAsNumber: true })}
                  />
                </FormField>
                <FormField label="Delivery type" htmlFor="deliveryType" error={errors.deliveryType?.message} required>
                  <Controller
                    control={control}
                    name="deliveryType"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="deliveryType"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STANDARD">Standard</SelectItem>
                          <SelectItem value="EXPRESS">Express</SelectItem>
                          <SelectItem value="SAME_DAY">Same Day</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField label="Parcel type" htmlFor="parcelType" error={errors.parcelType?.message} required>
                  <Controller
                    control={control}
                    name="parcelType"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="parcelType"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DOCUMENT">Document</SelectItem>
                          <SelectItem value="REGULAR">Regular</SelectItem>
                          <SelectItem value="FRAGILE">Fragile</SelectItem>
                          <SelectItem value="OVERSIZED">Oversized</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Items <span className="text-destructive">*</span></p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ description: "", weightKg: 0.5, quantity: 1, parcelType: "REGULAR" })}
                  >
                    <Plus className="mr-1 size-3" />
                    Add item
                  </Button>
                </div>
                {errors.items && (
                  <p className="text-xs text-destructive mb-2">{errors.items.root?.message ?? errors.items.message}</p>
                )}
                <div className="space-y-3">
                  {fields.map((field, idx) => (
                    <div key={field.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Item {idx + 1}</p>
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => remove(idx)}>
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <FormField label="Description" htmlFor={`items.${idx}.description`} error={errors.items?.[idx]?.description?.message} required>
                        <Input
                          id={`items.${idx}.description`}
                          placeholder="e.g. Books, Electronics"
                          {...register(`items.${idx}.description`)}
                        />
                      </FormField>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField label="Weight (kg)" htmlFor={`items.${idx}.weightKg`} error={errors.items?.[idx]?.weightKg?.message}>
                          <Input
                            id={`items.${idx}.weightKg`}
                            type="number"
                            step="0.1"
                            min="0.1"
                            {...register(`items.${idx}.weightKg`, { valueAsNumber: true })}
                          />
                        </FormField>
                        <FormField label="Quantity" htmlFor={`items.${idx}.quantity`} error={errors.items?.[idx]?.quantity?.message}>
                          <Input
                            id={`items.${idx}.quantity`}
                            type="number"
                            min="1"
                            {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                          />
                        </FormField>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <FormField label="Description (optional)" htmlFor="description">
                <Textarea id="description" placeholder="Additional description…" rows={2} {...register("description")} />
              </FormField>
              <FormField label="Special instructions (optional)" htmlFor="specialInstructions">
                <Textarea id="specialInstructions" placeholder="Handle with care, leave at door, etc." rows={2} {...register("specialInstructions")} />
              </FormField>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & confirm</CardTitle>
              <CardDescription>Please review your shipment details before submitting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {priceBreakdown && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="size-4 text-primary" />
                    <p className="font-semibold text-primary">Delivery charge</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base price</span>
                      <span>{formatCurrency(priceBreakdown.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight charge</span>
                      <span>{formatCurrency(priceBreakdown.weightCharge)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zone surcharge</span>
                      <span>{formatCurrency(priceBreakdown.zoneSurcharge)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery type surcharge</span>
                      <span>{formatCurrency(priceBreakdown.deliveryTypeSurcharge)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(priceBreakdown.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm space-y-2">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">From</span>
                  <span className="font-medium">{getValues("senderName")}, {getValues("senderCity")}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium">{getValues("recipientName")}, {getValues("recipientCity")}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{getValues("declaredWeightKg")} kg</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">{getValues("deliveryType")}</span>
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                After creating, you will need to pay via bKash before pickup can be arranged.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 size-4" />
            Previous
          </Button>

          {step < 4 ? (
            <Button type="button" onClick={goNext} loading={isCalcPending}>
              Next
              <ArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button type="submit" loading={isPending}>
              <Package className="mr-2 size-4" />
              Create shipment
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
