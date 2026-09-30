import { Badge } from "@/components/ui/badge";
import {
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_STATUS_VARIANTS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
  COURIER_AVAILABILITY_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  DELIVERY_TYPE_LABELS,
} from "@/lib/utils";
import type {
  ShipmentStatus,
  PaymentStatus,
  CourierAvailability,
  AssignmentStatus,
  DeliveryType,
} from "@/types";

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <Badge variant={SHIPMENT_STATUS_VARIANTS[status]}>
      {SHIPMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={PAYMENT_STATUS_VARIANTS[status]}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function CourierAvailabilityBadge({
  availability,
}: {
  availability: CourierAvailability;
}) {
  const variants: Record<CourierAvailability, "success" | "destructive" | "warning"> = {
    AVAILABLE: "success",
    UNAVAILABLE: "destructive",
    ON_DELIVERY: "warning",
  };
  return (
    <Badge variant={variants[availability]}>
      {COURIER_AVAILABILITY_LABELS[availability]}
    </Badge>
  );
}

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const variants: Record<AssignmentStatus, "default" | "success" | "destructive" | "secondary"> = {
    ACTIVE: "default",
    COMPLETED: "success",
    CANCELLED: "destructive",
    REJECTED: "secondary",
  };
  return (
    <Badge variant={variants[status]}>
      {ASSIGNMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function DeliveryTypeBadge({ type }: { type: DeliveryType }) {
  const variants: Record<DeliveryType, "default" | "warning" | "destructive"> = {
    STANDARD: "default",
    EXPRESS: "warning",
    SAME_DAY: "destructive",
  };
  return (
    <Badge variant={variants[type]}>
      {DELIVERY_TYPE_LABELS[type]}
    </Badge>
  );
}
