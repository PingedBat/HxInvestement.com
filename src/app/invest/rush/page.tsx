import type { Metadata } from "next";
import { RushTerminal } from "@/components/invest/RushTerminal";

export const metadata: Metadata = {
  title: "Rush",
  description: "The weekly Rush cycle: countdown, order panel, open positions and leaderboard.",
};

export default function RushPage() {
  return <RushTerminal />;
}
