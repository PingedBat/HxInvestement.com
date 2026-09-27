import type { Metadata } from "next";
import { DeveloperDashboard } from "@/components/developer/DeveloperDashboard";

export const metadata: Metadata = {
  title: "Studio dashboard",
};

export default function DeveloperPage() {
  return <DeveloperDashboard />;
}
