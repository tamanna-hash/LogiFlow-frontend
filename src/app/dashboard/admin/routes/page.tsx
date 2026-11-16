"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  Plus, Pencil, Trash2, Route as RouteIcon, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { Pagination } from "@/components/shared/Pagination";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useHubs } from "@/features/hubs/hooks";
import {
  useRoutes, useCreateRoute, useUpdateRoute, useDeleteRoute,
} from "@/features/route-optimization/hooks";

export default function AdminRoutesPage() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Create form state
  const [fromHubId, setFromHubId] = useState("");
  const [toHubId, setToHubId] = useState("");
  const [cost, setCost] = useState("");

  // Edit form state
  const [editCost, setEditCost] = useState("");
  const [editActive, setEditActive] = useState(true);

  const { data: hubsData } = useHubs({ limit: 100 });
  const hubs = hubsData?.hubs ?? [];

  const { data: routesData, isLoading, isError, refetch } = useRoutes({ page, limit: 20 });
  const routes = routesData?.routes ?? [];
  const meta = routesData?.meta;

  const { mutate: create, isPending: creating_ } = useCreateRoute();
  const { mutate: update, isPending: updating } = useUpdateRoute();
  const { mutate: remove } = useDeleteRoute();

  function handleCreate() {
    if (!fromHubId || !toHubId || !cost) return;
    create(
      { fromHubId, toHubId, cost: parseFloat(cost), isActive: true },
      { onSuccess: () => { setCreating(false); setFromHubId(""); setToHubId(""); setCost(""); } },
    );
  }

  function startEdit(r: { id: string; cost: number; isActive: boolean }) {
    setEditId(r.id);
    setEditCost(String(r.cost));
    setEditActive(r.isActive);
  }

  function handleUpdate() {
    if (!editId) return;
    update(
      { id: editId, input: { cost: parseFloat(editCost), isActive: editActive } },
      { onSuccess: () => setEditId(null) },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Hub Route Network" description="Manage the directed hub-to-hub transportation connections used by the route optimizer.">
        <Button size="sm" onClick={() => setCreating(!creating)}>
          {creating ? <ChevronUp className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
          {creating ? "Cancel" : "Add Route"}
        </Button>
      </PageHeader>

      {/* Create form */}
      {creating && (
        <Card>
          <CardContent className="pt-4 pb-4 grid gap-3 sm:grid-cols-4">
            <Select value={fromHubId} onValueChange={setFromHubId}>
              <SelectTrigger><SelectValue placeholder="From hub" /></SelectTrigger>
              <SelectContent>
                {hubs.map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={toHubId} onValueChange={setToHubId}>
              <SelectTrigger><SelectValue placeholder="To hub" /></SelectTrigger>
              <SelectContent>
                {hubs.filter((h) => h.id !== fromHubId).map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={0.01}
              step="0.1"
              placeholder="Cost (e.g. 5)"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            <Button
              onClick={handleCreate}
              disabled={creating_ || !fromHubId || !toHubId || !cost}
            >
              {creating_ ? "Creating…" : "Create"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Routes table */}
      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6"><ErrorState title="Could not load routes" onRetry={() => void refetch()} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">From Hub</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">To Hub</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cost</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                {isLoading ? (
                  <TableSkeleton rows={5} cols={5} />
                ) : routes.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-4 py-12">
                        <EmptyState
                          icon={<RouteIcon className="size-6" />}
                          title="No routes configured"
                          description="Add routes to enable the route optimizer."
                        />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {routes.map((r) => (
                      editId === r.id ? (
                        <tr key={r.id} className="border-b bg-muted/20">
                          <td className="px-4 py-3 font-medium">{r.fromHub.name}</td>
                          <td className="px-4 py-3 font-medium">{r.toHub.name}</td>
                          <td className="px-4 py-3">
                            <Input
                              type="number" min={0.01} step="0.1"
                              className="h-7 w-24"
                              value={editCost}
                              onChange={(e) => setEditCost(e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Select value={editActive ? "true" : "false"} onValueChange={(v) => setEditActive(v === "true")}>
                              <SelectTrigger className="h-7 w-28"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={handleUpdate} disabled={updating}>Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{r.fromHub.name}</td>
                          <td className="px-4 py-3 font-medium">{r.toHub.name}</td>
                          <td className="px-4 py-3 font-semibold tabular-nums">{r.cost}</td>
                          <td className="px-4 py-3">
                            <Badge variant={r.isActive ? "success" : "secondary"}>
                              {r.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => startEdit(r)}>
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => setDeleteId(r.id)}>
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {meta && <Pagination meta={meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Delete route?"
        description="This removes the connection from the route network. Existing shipments are unaffected."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteId) remove(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        variant="destructive"
        loading={false}
      />
    </div>
  );
}
