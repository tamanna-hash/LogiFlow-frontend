"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/shared/FormField";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/auth";
import { useCurrentUser } from "@/features/auth/hooks";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/lib/validations/profile";
import { getInitials } from "@/lib/utils";
import { apiPostFormData } from "@/lib/api/client";
import { USER_ENDPOINTS } from "@/lib/api/endpoints";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-client";
import type { AuthUser } from "@/types";
import { ChangePasswordSection } from "./ChangePasswordSection";

export function ProfileEditor() {
  const { user, setUser } = useAuthStore();
  const { isLoading } = useCurrentUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? "",
        defaultAddress: user.customerProfile?.defaultAddress ?? "",
        city: user.customerProfile?.city ?? "",
        postalCode: user.customerProfile?.postalCode ?? "",
        vehicleType: user.courierProfile?.vehicleType ?? "",
        vehicleNumber: user.courierProfile?.vehicleNumber ?? "",
        licenseNumber: user.courierProfile?.licenseNumber ?? "",
      });
    }
  }, [user, reset]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: UpdateProfileFormValues) {
    setIsSaving(true);
    try {
      const formData = new FormData();
      // Only append non-empty fields
      if (values.firstName) formData.append("firstName", values.firstName);
      if (values.lastName) formData.append("lastName", values.lastName);
      if (values.phone) formData.append("phone", values.phone);
      if (values.defaultAddress) formData.append("defaultAddress", values.defaultAddress);
      if (values.city) formData.append("city", values.city);
      if (values.postalCode) formData.append("postalCode", values.postalCode);
      if (values.vehicleType) formData.append("vehicleType", values.vehicleType);
      if (values.vehicleNumber) formData.append("vehicleNumber", values.vehicleNumber);
      if (values.licenseNumber) formData.append("licenseNumber", values.licenseNumber);
      if (avatarFile) formData.append("avatar", avatarFile);

      const resp = await apiPostFormData<AuthUser>(USER_ENDPOINTS.me, formData);
      setUser(resp.data);
      queryClient.setQueryData(queryKeys.currentUser, resp.data);
      toast.success("Profile updated.");
      setAvatarFile(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading && !user) {
    return (
      <div className="space-y-4 max-w-2xl">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>Update your account details and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="size-20">
                  <AvatarImage src={avatarPreview ?? user?.avatarUrl ?? undefined} alt="Profile photo" />
                  <AvatarFallback className="text-lg">
                    {user ? getInitials(user.firstName, user.lastName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Change profile photo"
                >
                  <Camera className="size-3.5" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase().replace("_", " ")}</p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Upload profile photo"
              onChange={handleAvatarChange}
            />

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message}>
                <Input id="firstName" {...register("firstName")} />
              </FormField>
              <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
                <Input id="lastName" {...register("lastName")} />
              </FormField>
            </div>

            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message} hint="Bangladesh number">
              <Input id="phone" type="tel" placeholder="01700000000" {...register("phone")} />
            </FormField>

            {/* Customer fields */}
            {user?.role === "CUSTOMER" && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-3">Delivery preferences</p>
                  <div className="space-y-4">
                    <FormField label="Default address" htmlFor="defaultAddress" error={errors.defaultAddress?.message}>
                      <Input id="defaultAddress" placeholder="Your default delivery address" {...register("defaultAddress")} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="City" htmlFor="city" error={errors.city?.message}>
                        <Input id="city" {...register("city")} />
                      </FormField>
                      <FormField label="Postal code" htmlFor="postalCode" error={errors.postalCode?.message}>
                        <Input id="postalCode" {...register("postalCode")} />
                      </FormField>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Courier fields */}
            {user?.role === "COURIER" && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-3">Vehicle information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Vehicle type" htmlFor="vehicleType" error={errors.vehicleType?.message}>
                      <Input id="vehicleType" placeholder="Motorcycle" {...register("vehicleType")} />
                    </FormField>
                    <FormField label="Vehicle number" htmlFor="vehicleNumber" error={errors.vehicleNumber?.message}>
                      <Input id="vehicleNumber" placeholder="Dhaka Metro Ga-12-3456" {...register("vehicleNumber")} />
                    </FormField>
                    <FormField label="License number" htmlFor="licenseNumber" error={errors.licenseNumber?.message} className="col-span-2">
                      <Input id="licenseNumber" {...register("licenseNumber")} />
                    </FormField>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end">
              <Button type="submit" loading={isSaving} disabled={!isDirty && !avatarFile}>
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <ChangePasswordSection />
    </div>
  );
}
