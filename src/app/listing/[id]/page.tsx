import type { Metadata } from "next";
import { UserListingView } from "@/components/listing/UserListingView";

export const metadata: Metadata = {
  title: "Your listing",
};

export default async function UserListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserListingView id={id} />;
}
