import { z } from "zod";

const BD_PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

export const shipmentItemSchema = z.object({
  description: z.string().min(1, "Item description is required").max(200),
  weightKg: z.number().positive("Weight must be positive"),
  quantity: z.number().int().positive().default(1),
  parcelType: z
    .enum(["DOCUMENT", "REGULAR", "FRAGILE", "OVERSIZED"])
    .default("REGULAR"),
});

export const createShipmentSchema = z.object({
  senderName: z
    .string()
    .min(2, "Sender name must be at least 2 characters")
    .max(100),
  senderPhone: z
    .string()
    .regex(BD_PHONE_REGEX, "Invalid Bangladesh phone number"),
  senderAddress: z
    .string()
    .min(5, "Sender address must be at least 5 characters")
    .max(200),
  senderCity: z
    .string()
    .min(2, "Sender city must be at least 2 characters")
    .max(100),
  originZoneId: z.string().min(1, "Origin zone is required"),
  recipientName: z
    .string()
    .min(2, "Recipient name must be at least 2 characters")
    .max(100),
  recipientPhone: z
    .string()
    .regex(BD_PHONE_REGEX, "Invalid Bangladesh phone number"),
  recipientAddress: z
    .string()
    .min(5, "Recipient address must be at least 5 characters")
    .max(200),
  recipientCity: z
    .string()
    .min(2, "Recipient city must be at least 2 characters")
    .max(100),
  destinationZoneId: z.string().min(1, "Destination zone is required"),
  deliveryType: z
    .enum(["STANDARD", "EXPRESS", "SAME_DAY"])
    .default("STANDARD"),
  parcelType: z
    .enum(["DOCUMENT", "REGULAR", "FRAGILE", "OVERSIZED"])
    .default("REGULAR"),
  declaredWeightKg: z.number().positive("Weight must be positive"),
  description: z.string().max(300).optional(),
  specialInstructions: z.string().max(300).optional(),
  items: z
    .array(shipmentItemSchema)
    .min(1, "At least one item is required"),
});

export type CreateShipmentFormValues = z.infer<typeof createShipmentSchema>;

export const updateShipmentSchema = z.object({
  recipientName: z.string().min(2).max(100).optional(),
  recipientPhone: z
    .string()
    .regex(BD_PHONE_REGEX)
    .optional()
    .or(z.literal("")),
  recipientAddress: z.string().min(5).max(200).optional(),
  recipientCity: z.string().min(2).max(100).optional(),
  specialInstructions: z.string().max(300).optional(),
});

export type UpdateShipmentFormValues = z.infer<typeof updateShipmentSchema>;

export const cancelShipmentSchema = z.object({
  reason: z
    .string()
    .min(5, "Cancellation reason must be at least 5 characters")
    .max(300),
});

export type CancelShipmentFormValues = z.infer<typeof cancelShipmentSchema>;

export const pickupRequestSchema = z.object({
  scheduledAt: z.string().optional(),
  notes: z.string().max(300).optional(),
});

export type PickupRequestFormValues = z.infer<typeof pickupRequestSchema>;

export const calculatePriceSchema = z.object({
  originZoneId: z.string().min(1, "Origin zone is required"),
  destinationZoneId: z.string().min(1, "Destination zone is required"),
  deliveryType: z.enum(["STANDARD", "EXPRESS", "SAME_DAY"]).default("STANDARD"),
  parcelType: z
    .enum(["DOCUMENT", "REGULAR", "FRAGILE", "OVERSIZED"])
    .default("REGULAR"),
  weightKg: z.number().positive("Weight must be positive"),
});

export type CalculatePriceFormValues = z.infer<typeof calculatePriceSchema>;
