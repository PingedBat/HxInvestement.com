import type { Metadata } from "next";
import { SubmitFlow } from "@/components/developer/SubmitFlow";

export const metadata: Metadata = {
  title: "List a game",
  description: "Submit a game for listing: platform, details, valuation, review.",
};

export default function SubmitPage() {
  return <SubmitFlow />;
}
