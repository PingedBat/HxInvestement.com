import { Suspense } from "react";
import type { Metadata } from "next";
import { SignupFlow } from "@/components/signup/SignupFlow";

export const metadata: Metadata = {
  title: "Open an account",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <SignupFlow />
    </Suspense>
  );
}
