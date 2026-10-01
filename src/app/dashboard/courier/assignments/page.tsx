import type { Metadata } from "next";
import { Suspense } from "react";
import { AssignmentsList } from "./AssignmentsList";

export const metadata: Metadata = { title: "My Assignments" };
export const dynamic = "force-dynamic";

export default function AssignmentsPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
      <AssignmentsList />
    </Suspense>
  );
}
