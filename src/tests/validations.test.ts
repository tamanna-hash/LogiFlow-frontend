import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, verifyEmailSchema, changePasswordSchema } from "@/lib/validations/auth";
import { cancelShipmentSchema, calculatePriceSchema } from "@/lib/validations/shipment";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "securePass123",
      confirmPassword: "securePass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "differentpass",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(i => i.path.includes("confirmPassword"));
      expect(confirmError).toBeDefined();
    }
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "not-an-email",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid Bangladesh phone number", () => {
    const result = registerSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
      phone: "01700123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid Bangladesh phone number", () => {
    const result = registerSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
      phone: "12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "pass" });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("verifyEmailSchema", () => {
  it("accepts valid 6-digit OTP", () => {
    const result = verifyEmailSchema.safeParse({ email: "a@b.com", otp: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects non-digit OTP", () => {
    const result = verifyEmailSchema.safeParse({ email: "a@b.com", otp: "12345a" });
    expect(result.success).toBe(false);
  });

  it("rejects 5-digit OTP", () => {
    const result = verifyEmailSchema.safeParse({ email: "a@b.com", otp: "12345" });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("accepts valid passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old_pass",
      newPassword: "new_password123",
      confirmNewPassword: "new_password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched new passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old",
      newPassword: "newpass123",
      confirmNewPassword: "different",
    });
    expect(result.success).toBe(false);
  });
});

describe("calculatePriceSchema", () => {
  it("accepts valid price calculation input", () => {
    const result = calculatePriceSchema.safeParse({
      originZoneId: "abc123",
      destinationZoneId: "def456",
      deliveryType: "STANDARD",
      parcelType: "REGULAR",
      weightKg: 2.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative weight", () => {
    const result = calculatePriceSchema.safeParse({
      originZoneId: "abc",
      destinationZoneId: "def",
      deliveryType: "STANDARD",
      parcelType: "REGULAR",
      weightKg: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid delivery type", () => {
    const result = calculatePriceSchema.safeParse({
      originZoneId: "abc",
      destinationZoneId: "def",
      deliveryType: "SUPER_FAST",
      parcelType: "REGULAR",
      weightKg: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("cancelShipmentSchema", () => {
  it("accepts valid reason", () => {
    const result = cancelShipmentSchema.safeParse({ reason: "No longer needed" });
    expect(result.success).toBe(true);
  });

  it("rejects short reason", () => {
    const result = cancelShipmentSchema.safeParse({ reason: "No" });
    expect(result.success).toBe(false);
  });
});
