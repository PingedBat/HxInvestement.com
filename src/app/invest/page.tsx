import type { Metadata } from "next";
import { VaultDashboard } from "@/components/invest/VaultDashboard";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Vault holdings, cost basis, unrealised gain and value over time.",
};

export default function InvestPage() {
  return <VaultDashboard />;
}
