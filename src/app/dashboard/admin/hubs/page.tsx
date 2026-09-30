"use client";

import Link from "next/link";
import { useState } from "react";
import { Warehouse, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { Badge } from "@/components/ui/badge";
import { useHubs, useCreateHub } from "@/features/hubs/hooks";

const hubSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  phone: z.string().optional(),
});
type HubFormValues = z.infer<typeof hubSchema>;

export default function AdminHubsPage() {
  const { data, isLoading, isError, refetch } = useHubs({ limit: 20 });
  const { mutate: createHub, isPending } = useCreateHub();
  const [showCreate, setShowCreate] = useState(false);

  const form = useForm<HubFormValues>({ resolver: zodResolver(hubSchema) });

  function handleCreate(vals: HubFormValues) {
    createHub(vals, { onSuccess: () => { setShowCreate(false); form.reset(); } });
  }

  const hubs = data?.hubs ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Hub Management" description="Manage logistics hubs and their zones.">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 size-4" />
          New hub
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6"><ErrorState title="Could not load hubs" onRetry={() => refetch()} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Code</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">City</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="sr-only">Actions</th>
                  </tr>
                </thead>
                {isLoading ? <TableSkeleton rows={4} cols={4} /> : hubs.length === 0 ? (
                  <tbody>
                    <tr><td colSpan={5} className="px-4 py-12">
                      <EmptyState icon={<Warehouse className="size-6" />} title="No hubs yet" description="Create your first hub." />
                    </td></tr>
                  </tbody>
                ) : (
                  <tbody>
                    {hubs.map((h) => (
                      <tr key={h.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{h.name}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground hidden sm:table-cell">{h.code}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{h.city}</td>
                        <td className="px-4 py-3">
                          <Badge variant={h.isActive ? "success" : "destructive"}>{h.isActive ? "Active" : "Inactive"}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/admin/hubs/${h.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new hub</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreate)}>
            <div className="space-y-4 py-4">
              <FormField label="Hub name" htmlFor="hubName" error={form.formState.errors.name?.message} required>
                <Input id="hubName" placeholder="Dhaka Central Hub" {...form.register("name")} />
              </FormField>
              <FormField label="Hub code" htmlFor="hubCode" error={form.formState.errors.code?.message} required>
                <Input id="hubCode" placeholder="DCH" {...form.register("code")} />
              </FormField>
              <FormField label="Address" htmlFor="hubAddr" error={form.formState.errors.address?.message} required>
                <Input id="hubAddr" {...form.register("address")} />
              </FormField>
              <FormField label="City" htmlFor="hubCity" error={form.formState.errors.city?.message} required>
                <Input id="hubCity" {...form.register("city")} />
              </FormField>
              <FormField label="Phone (optional)" htmlFor="hubPhone">
                <Input id="hubPhone" type="tel" {...form.register("phone")} />
              </FormField>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" loading={isPending}>Create hub</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
