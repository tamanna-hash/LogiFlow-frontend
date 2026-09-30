import type { Metadata } from "next";
import { AssignmentsList } from "./AssignmentsList";

export const metadata: Metadata = { title: "My Assignments" };

export default function AssignmentsPage() {
  return <AssignmentsList />;
}
