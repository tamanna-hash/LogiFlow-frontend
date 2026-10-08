import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  getInitials,
  truncate,
  buildQueryString,
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_STATUS_VARIANTS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
  COURIER_AVAILABILITY_LABELS,
  DELIVERY_TYPE_LABELS,
  PARCEL_TYPE_LABELS,
} from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats BDT amounts correctly", () => {
    expect(formatCurrency(100)).toBe("BDT 100.00");
    expect(formatCurrency(99.9)).toBe("BDT 99.90");
    expect(formatCurrency(0)).toBe("BDT 0.00");
    expect(formatCurrency("250.5")).toBe("BDT 250.50");
  });

  it("handles NaN gracefully", () => {
    expect(formatCurrency("not-a-number")).toBe("BDT 0.00");
  });

  it("respects custom currency", () => {
    expect(formatCurrency(50, "USD")).toBe("USD 50.00");
  });
});

describe("getInitials", () => {
  it("returns uppercase first letters", () => {
    expect(getInitials("John", "Doe")).toBe("JD");
    expect(getInitials("alice", "smith")).toBe("AS");
  });
});

describe("truncate", () => {
  it("returns string unchanged if within limit", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("truncates with ellipsis beyond limit", () => {
    expect(truncate("Hello World", 5)).toBe("Hello…");
  });
});

describe("buildQueryString", () => {
  it("builds a query string from params", () => {
    expect(buildQueryString({ page: 1, limit: 10 })).toBe("?page=1&limit=10");
  });

  it("omits null and undefined values", () => {
    expect(buildQueryString({ page: 1, status: null, search: undefined })).toBe("?page=1");
  });

  it("returns empty string with no valid params", () => {
    expect(buildQueryString({ status: null })).toBe("");
  });
});

describe("SHIPMENT_STATUS_LABELS", () => {
  it("has labels for all statuses", () => {
    const statuses = [
      "CREATED", "PICKUP_REQUESTED", "ASSIGNED", "PICKED_UP",
      "AT_ORIGIN_HUB", "IN_TRANSIT", "AT_DESTINATION_HUB",
      "OUT_FOR_DELIVERY", "DELIVERED", "DELIVERY_FAILED",
      "CANCELLED", "RETURN_INITIATED", "RETURNING", "RETURNED",
    ] as const;
    statuses.forEach(s => {
      expect(SHIPMENT_STATUS_LABELS[s]).toBeTruthy();
    });
  });
});

describe("SHIPMENT_STATUS_VARIANTS", () => {
  it("assigns success to DELIVERED", () => {
    expect(SHIPMENT_STATUS_VARIANTS.DELIVERED).toBe("success");
  });

  it("assigns destructive to CANCELLED and DELIVERY_FAILED", () => {
    expect(SHIPMENT_STATUS_VARIANTS.CANCELLED).toBe("destructive");
    expect(SHIPMENT_STATUS_VARIANTS.DELIVERY_FAILED).toBe("destructive");
  });
});

describe("PAYMENT_STATUS_LABELS", () => {
  it("labels COMPLETED as Paid", () => {
    expect(PAYMENT_STATUS_LABELS.COMPLETED).toBe("Paid");
  });

  it("has label for all payment statuses", () => {
    ["PENDING","COMPLETED","FAILED","CANCELLED","REFUND_PENDING","REFUNDED"].forEach(s => {
      expect(PAYMENT_STATUS_LABELS[s as keyof typeof PAYMENT_STATUS_LABELS]).toBeTruthy();
    });
  });
});

describe("PAYMENT_STATUS_VARIANTS", () => {
  it("assigns success to COMPLETED", () => {
    expect(PAYMENT_STATUS_VARIANTS.COMPLETED).toBe("success");
  });

  it("assigns destructive to FAILED", () => {
    expect(PAYMENT_STATUS_VARIANTS.FAILED).toBe("destructive");
  });
});

describe("DELIVERY_TYPE_LABELS", () => {
  it("has labels for all types", () => {
    expect(DELIVERY_TYPE_LABELS.STANDARD).toBe("Standard");
    expect(DELIVERY_TYPE_LABELS.EXPRESS).toBe("Express");
    expect(DELIVERY_TYPE_LABELS.SAME_DAY).toBe("Same Day");
  });
});

describe("PARCEL_TYPE_LABELS", () => {
  it("has labels for all parcel types", () => {
    expect(PARCEL_TYPE_LABELS.DOCUMENT).toBe("Document");
    expect(PARCEL_TYPE_LABELS.REGULAR).toBe("Regular");
    expect(PARCEL_TYPE_LABELS.FRAGILE).toBe("Fragile");
    expect(PARCEL_TYPE_LABELS.OVERSIZED).toBe("Oversized");
  });
});

describe("COURIER_AVAILABILITY_LABELS", () => {
  it("has labels for all availability states", () => {
    expect(COURIER_AVAILABILITY_LABELS.AVAILABLE).toBe("Available");
    expect(COURIER_AVAILABILITY_LABELS.UNAVAILABLE).toBe("Unavailable");
    expect(COURIER_AVAILABILITY_LABELS.ON_DELIVERY).toBe("On Delivery");
  });
});
