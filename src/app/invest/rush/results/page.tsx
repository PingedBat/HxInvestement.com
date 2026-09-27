import type { Metadata } from "next";
import { RushResults } from "@/components/invest/RushResults";

export const metadata: Metadata = {
  title: "Rush results",
  description: "How the last Rush cycle finished.",
};

export default function RushResultsPage() {
  return <RushResults />;
}
