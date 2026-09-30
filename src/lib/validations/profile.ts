import { z } from "zod";

const BD_PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z
    .string()
    .regex(BD_PHONE_REGEX, "Invalid Bangladesh phone number")
    .optional()
    .or(z.literal("")),
  // Customer profile
  defaultAddress: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  // Courier profile
  vehicleType: z.string().max(50).optional(),
  vehicleNumber: z.string().max(30).optional(),
  licenseNumber: z.string().max(30).optional(),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
