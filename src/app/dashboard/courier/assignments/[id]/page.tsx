"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Package, MapPin, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { AssignmentStatusBadge, ShipmentStatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAssignments, useAcceptAssignment, useRejectAssignment, useConfirmPickup, useRecordDelivery, useRecordDeliveryFailed } from "@/features/couriers/hooks";
import { formatDateTime } from "@/lib/utils";

const rejectSchema = z.object({ reason: z.string().max(300).optional() });
const deliveryFailedSchema = z.object({
  failureReason: z.enum(["NO_ONE_HOME", "ADDRESS_NOT_FOUND", "REFUSED_BY_RECIPIENT", "DAMAGED_IN_TRANSIT", "OTHER"]),
  notes: z.string().max(300).optional(),
});
const deliverySchema = z.object({ notes: z.string().max(300).optional() });

type RejectFormValues = z.infer<typeof rejectSchema>;
type DeliveryFailedFormValues = z.infer<typeof deliveryFailedSchema>;
type DeliveryFormValues = z.infer<typeof deliverySchema>;

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, isError } = useAssignments({ limit: 100 });
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showFailedDialog, setShowFailedDialog] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  const { mutate: accept, isPending: isAccepting } = useAcceptAssignment();
  const { mutate: reject, isPending: isRejecting } = useRejectAssignment();
  const { mutate: confirmPickup, isPending: isPickingUp } = useConfirmPickup();
  const { mutate: recordDelivery, isPending: isDelivering } = useRecordDelivery();
  const { mutate: recordFailed, isPending: isRecordingFailed } = useRecordDeliveryFailed();

  const rejectForm = useForm<RejectFormValues>({ resolver: zodResolver(rejectSchema) });
  const deliveryFailedForm = useForm<DeliveryFailedFormValues>({ resolver: zodResolver(deliveryFailedSchema) });
  const deliveryForm = useForm<DeliveryFormValues>({ resolver: zodResolver(deliverySchema) });

  const assignment = data?.assignments.find((a) => a.id === params.id);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  }

  if (isError || !assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Assignment not found.</p>
        <Button variant="ghost" asChild className="mt-4">
          <Link href="/dashboard/courier/assignments">Back to assignments</Link>
        </Button>
      </div>
    );
  }

  const s = assignment.shipment;
  const isActive = assignment.status === "ACTIVE";
  const canAccept = isActive && !assignment.acceptedAt;
  const canPickup = isActive && assignment.acceptedAt && s.status === "ASSIGNED";
  const canDeliver = isActive && s.status === "OUT_FOR_DELIVERY";

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/courier/assignments">
          <ArrowLeft className="mr-2 size-4" />
          Back to assignments
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold font-mono">{s.trackingNumber}</h1>
          <p className="text-sm text-muted-foreground">Assignment type: {assignment.type}</p>
        </div>
        <div className="flex gap-2">
          <AssignmentStatusBadge status={assignment.status} />
          <ShipmentStatusBadge status={s.status} />
        </div>
      </div>

      {/* Actions */}
      {isActive && (
        <div className="flex flex-wrap gap-2">
          {canAccept && (
            <Button onClick={() => accept(assignment.id)} loading={isAccepting}>
              <CheckCircle className="mr-2 size-4" />
              Accept assignment
            </Button>
          )}
          {canPickup && (
            <Button onClick={() => confirmPickup(s.id)} loading={isPickingUp}>
              <Package className="mr-2 size-4" />
              Confirm pickup
            </Button>
          )}
          {canDeliver && (
            <>
              <Button onClick={() => setShowDeliveryDialog(true)}>
                <CheckCircle className="mr-2 size-4" />
                Record delivery
              </Button>
              <Button variant="outline" onClick={() => setShowFailedDialog(true)}>
                <XCircle className="mr-2 size-4" />
                Delivery failed
              </Button>
            </>
          )}
          {canAccept && (
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => setShowRejectDialog(true)}
            >
              Reject
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="size-4" />
            Delivery address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{s.recipientName}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Phone className="size-3.5" />
            {s.recipientPhone}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{s.recipientAddress}</p>
          <p className="text-sm text-muted-foreground">{s.recipientCity}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Assigned at</dt>
              <dd>{formatDateTime(assignment.assignedAt)}</dd>
            </div>
            {assignment.acceptedAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Accepted at</dt>
                <dd>{formatDateTime(assignment.acceptedAt)}</dd>
              </div>
            )}
            {assignment.pickedUpAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Picked up at</dt>
                <dd>{formatDateTime(assignment.pickedUpAt)}</dd>
              </div>
            )}
            {assignment.deliveredAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivered at</dt>
                <dd>{formatDateTime(assignment.deliveredAt)}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>Reject assignment</CardTitle></CardHeader>
            <form onSubmit={rejectForm.handleSubmit((vals) => {
              reject({ id: assignment.id, reason: vals.reason }, {
                onSuccess: () => setShowRejectDialog(false),
              });
            })}>
              <CardContent className="space-y-4">
                <FormField label="Reason (optional)" htmlFor="rejectReason">
                  <Textarea id="rejectReason" rows={3} placeholder="Why are you rejecting this assignment?" {...rejectForm.register("reason")} />
                </FormField>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
                  <Button type="submit" variant="destructive" loading={isRejecting}>Reject</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Record Delivery Dialog */}
      {showDeliveryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>Record delivery</CardTitle></CardHeader>
            <form onSubmit={deliveryForm.handleSubmit((vals) => {
              recordDelivery({ shipmentId: s.id, data: { notes: vals.notes, proofImage: proofFile ?? undefined } }, {
                onSuccess: () => setShowDeliveryDialog(false),
              });
            })}>
              <CardContent className="space-y-4">
                <FormField label="Proof of delivery (optional)" htmlFor="proof">
                  <Input
                    id="proof"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                  />
                </FormField>
                <FormField label="Notes (optional)" htmlFor="deliveryNotes">
                  <Textarea id="deliveryNotes" rows={2} {...deliveryForm.register("notes")} />
                </FormField>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowDeliveryDialog(false)}>Cancel</Button>
                  <Button type="submit" loading={isDelivering}>Confirm delivery</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Delivery Failed Dialog */}
      {showFailedDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>Record delivery failure</CardTitle></CardHeader>
            <form onSubmit={deliveryFailedForm.handleSubmit((vals) => {
              recordFailed({ shipmentId: s.id, data: vals }, {
                onSuccess: () => setShowFailedDialog(false),
              });
            })}>
              <CardContent className="space-y-4">
                <FormField label="Reason" htmlFor="failureReason" error={deliveryFailedForm.formState.errors.failureReason?.message} required>
                  <Select onValueChange={(v) => deliveryFailedForm.setValue("failureReason", v as DeliveryFailedFormValues["failureReason"])}>
                    <SelectTrigger id="failureReason"><SelectValue placeholder="Select reason" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO_ONE_HOME">No one home</SelectItem>
                      <SelectItem value="ADDRESS_NOT_FOUND">Address not found</SelectItem>
                      <SelectItem value="REFUSED_BY_RECIPIENT">Refused by recipient</SelectItem>
                      <SelectItem value="DAMAGED_IN_TRANSIT">Damaged in transit</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Notes (optional)" htmlFor="failureNotes">
                  <Textarea id="failureNotes" rows={2} {...deliveryFailedForm.register("notes")} />
                </FormField>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowFailedDialog(false)}>Cancel</Button>
                  <Button type="submit" variant="destructive" loading={isRecordingFailed}>Submit</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
